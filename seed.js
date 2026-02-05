const { nanoid } = require('nanoid');
const { sequelize, Lead, Event } = require('./models');

const sampleLeads = [
  {
    firstName: 'Avery',
    lastName: 'Nguyen',
    email: 'avery@example.com',
    company: 'Pulse Metrics',
    role: 'Head of Growth',
    niche: 'B2B SaaS',
    painPoint: 'Pipeline volatility',
    budget: '$5k-$10k',
    timeline: '30 days',
    goals: 'Increase qualified demos by 40%.',
    score: 72,
    temperature: 'warm',
    source: 'hero-cta',
    abVariant: 'B',
  },
  {
    firstName: 'Jordan',
    lastName: 'Reed',
    email: 'jordan@example.com',
    company: 'Brightline Legal',
    role: 'Founder',
    niche: 'Professional Services',
    painPoint: 'Lead follow-up gaps',
    budget: '$2k-$5k',
    timeline: '14 days',
    goals: 'Automate intake and scheduling.',
    score: 88,
    temperature: 'hot',
    source: 'exit-intent',
    abVariant: 'A',
  },
];

const sampleEvents = [
  { type: 'page_view', detail: 'landing', value: 1 },
  { type: 'scroll_50', detail: 'landing', value: 50 },
  { type: 'form_start', detail: 'lead-form', value: 1 },
  { type: 'form_submit', detail: 'lead-form', value: 1 },
];

const seed = async () => {
  await sequelize.sync({ force: true });
  for (const leadData of sampleLeads) {
    const lead = await Lead.create({ id: nanoid(12), ...leadData });
    for (const eventData of sampleEvents) {
      await Event.create({ leadId: lead.id, ...eventData });
    }
  }
  console.log('Seed data added.');
  await sequelize.close();
};

seed();
