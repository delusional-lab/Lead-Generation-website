const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const validator = require('validator');
const { nanoid } = require('nanoid');
const { stringify } = require('csv-stringify');
require('dotenv').config();

const { sequelize, Lead, LeadDraft, Event } = require('./models');
const { classifyTemperature, calculateScoreDelta } = require('./utils/leadScoring');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
}));

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
  },
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/csrf', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const sanitizeInput = (value) => {
  if (typeof value !== 'string') return '';
  return validator.escape(validator.trim(value));
};

const sanitizePayload = (payload) => {
  const cleaned = {};
  Object.keys(payload || {}).forEach((key) => {
    cleaned[key] = sanitizeInput(payload[key]);
  });
  return cleaned;
};

app.post('/api/lead/draft', csrfProtection, async (req, res) => {
  try {
    const { draftId, payload, lastStep } = req.body;
    const sanitized = sanitizePayload(payload || {});
    const id = draftId || nanoid(12);
    const [draft] = await LeadDraft.upsert({
      id,
      payload: JSON.stringify(sanitized),
      lastStep: Number(lastStep) || 1,
    });
    res.json({ draftId: draft.id || id });
  } catch (error) {
    res.status(400).json({ error: 'Unable to save draft.' });
  }
});

app.post('/api/lead', csrfProtection, async (req, res) => {
  try {
    const payload = sanitizePayload(req.body || {});
    if (!validator.isEmail(payload.email || '')) {
      return res.status(400).json({ error: 'Invalid email.' });
    }

    const id = nanoid(12);
    const lead = await Lead.create({
      id,
      ...payload,
      score: 0,
      temperature: 'cold',
    });

    res.json({ leadId: lead.id });
  } catch (error) {
    res.status(400).json({ error: 'Unable to create lead.' });
  }
});

app.post('/api/track', csrfProtection, async (req, res) => {
  try {
    const { leadId, type, detail, value, metadata } = req.body;
    const safeType = sanitizeInput(type);
    const safeDetail = sanitizeInput(detail);
    const safeValue = Number(value) || 0;
    const safeMetadata = sanitizeInput(metadata);

    await Event.create({
      leadId: leadId || null,
      type: safeType,
      detail: safeDetail,
      value: safeValue,
      metadata: safeMetadata,
    });

    if (leadId) {
      const lead = await Lead.findByPk(leadId);
      if (lead) {
        const delta = calculateScoreDelta({ type: safeType, value: safeValue });
        const newScore = lead.score + delta;
        await lead.update({
          score: newScore,
          temperature: classifyTemperature(newScore),
        });
      }
    }

    res.json({ status: 'tracked' });
  } catch (error) {
    res.status(400).json({ error: 'Unable to track event.' });
  }
});

app.get('/api/admin/leads', async (req, res) => {
  const leads = await Lead.findAll({ order: [['createdAt', 'DESC']] });
  res.json(leads);
});

app.get('/api/admin/analytics', async (req, res) => {
  const totalLeads = await Lead.count();
  const hotLeads = await Lead.count({ where: { temperature: 'hot' } });
  const warmLeads = await Lead.count({ where: { temperature: 'warm' } });
  const coldLeads = await Lead.count({ where: { temperature: 'cold' } });
  const totalEvents = await Event.count();

  res.json({
    totals: { totalLeads, hotLeads, warmLeads, coldLeads },
    totalEvents,
  });
});

app.get('/api/admin/funnel', async (req, res) => {
  const formStarts = await Event.count({ where: { type: 'form_start' } });
  const stepCompletions = await Event.count({ where: { type: 'form_step_complete' } });
  const submissions = await Event.count({ where: { type: 'form_submit' } });
  res.json({ formStarts, stepCompletions, submissions });
});

app.get('/api/admin/export', async (req, res) => {
  const leads = await Lead.findAll({ order: [['createdAt', 'DESC']] });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
  const stringifier = stringify({
    header: true,
    columns: [
      'id',
      'firstName',
      'lastName',
      'email',
      'company',
      'role',
      'phone',
      'website',
      'niche',
      'painPoint',
      'budget',
      'timeline',
      'goals',
      'score',
      'temperature',
      'source',
      'abVariant',
      'createdAt',
    ],
  });

  leads.forEach((lead) => {
    stringifier.write(lead.toJSON());
  });

  stringifier.pipe(res);
  stringifier.end();
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/dashboard', (req, res) => {
  res.redirect('/admin');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const start = async () => {
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`Lead generation app running on http://localhost:${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
    console.log(`Database storage: ${DATA_DIR}`);
  });
};

start();
