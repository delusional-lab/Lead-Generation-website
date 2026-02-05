const state = {
  step: 1,
  totalSteps: 3,
  draftId: localStorage.getItem('draftId'),
  leadId: localStorage.getItem('leadId'),
  abVariant: localStorage.getItem('abVariant') || (Math.random() > 0.5 ? 'A' : 'B'),
  csrfToken: '',
  formStarted: false,
  startTime: Date.now(),
};

const selectors = {
  form: document.getElementById('leadForm'),
  steps: document.querySelectorAll('.form-step'),
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  nextBtn: document.getElementById('nextBtn'),
  prevBtn: document.getElementById('prevBtn'),
  saveBtn: document.getElementById('saveBtn'),
  successMessage: document.getElementById('successMessage'),
  websiteField: document.getElementById('websiteField'),
  aiSuggestion: document.getElementById('aiSuggestion'),
  primaryCta: document.getElementById('primaryCta'),
  secondaryCta: document.getElementById('secondaryCta'),
  exitModal: document.getElementById('exitModal'),
  exitClose: document.getElementById('exitClose'),
  exitSubmit: document.getElementById('exitSubmit'),
  exitEmail: document.getElementById('exitEmail'),
  heroHeadline: document.getElementById('heroHeadline'),
  heroSubhead: document.getElementById('heroSubhead'),
};

const apiRequest = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': state.csrfToken,
    },
    body: JSON.stringify(payload),
  });
  return response.json();
};

const fetchCsrf = async () => {
  const response = await fetch('/api/csrf');
  const data = await response.json();
  state.csrfToken = data.csrfToken;
};

const updateProgress = () => {
  const percent = (state.step / state.totalSteps) * 100;
  selectors.progressFill.style.width = `${percent}%`;
  selectors.progressText.textContent = `Step ${state.step} of ${state.totalSteps}`;
};

const showStep = (step) => {
  selectors.steps.forEach((el) => {
    el.classList.toggle('active', Number(el.dataset.step) === step);
  });
  selectors.prevBtn.style.display = step === 1 ? 'none' : 'inline-flex';
  selectors.nextBtn.textContent = step === state.totalSteps ? 'Submit' : 'Next';
  updateProgress();
};

const getFormData = () => {
  const formData = new FormData(selectors.form);
  const payload = {};
  for (const [key, value] of formData.entries()) {
    payload[key] = value;
  }
  payload.abVariant = state.abVariant;
  payload.source = payload.source || 'landing';
  return payload;
};

const validateStep = () => {
  let isValid = true;
  const currentStep = document.querySelector(`.form-step[data-step="${state.step}"]`);
  const fields = currentStep.querySelectorAll('input, select, textarea');
  fields.forEach((field) => {
    const errorEl = document.querySelector(`[data-error-for="${field.name}"]`);
    if (field.required && !field.value.trim()) {
      isValid = false;
      if (errorEl) errorEl.textContent = 'This field is required.';
    } else if (field.type === 'email' && field.value && !/\S+@\S+\.\S+/.test(field.value)) {
      isValid = false;
      if (errorEl) errorEl.textContent = 'Enter a valid email.';
    } else {
      if (errorEl) errorEl.textContent = '';
    }
  });
  return isValid;
};

const updateConditionalFields = () => {
  const niche = document.getElementById('niche').value;
  selectors.websiteField.style.display = niche === 'B2B SaaS' || niche === 'Ecommerce' ? 'flex' : 'none';
};

const updateAiSuggestion = () => {
  const painPoint = document.getElementById('painPoint').value;
  const budget = document.getElementById('budget').value;
  const timeline = document.getElementById('timeline').value;

  if (!painPoint || !budget || !timeline) {
    selectors.aiSuggestion.innerHTML = '<strong>AI Suggestion:</strong> <span>Answer a few fields to unlock suggestions.</span>';
    return;
  }

  const suggestion = `Focus on ${painPoint.toLowerCase()} with a ${budget} sprint. A ${timeline} launch window needs rapid qualification and automated follow-up.`;
  selectors.aiSuggestion.innerHTML = `<strong>AI Suggestion:</strong> <span>${suggestion}</span>`;
};

const trackEvent = async (type, detail, value, metadata = '') => {
  await apiRequest('/api/track', {
    leadId: state.leadId,
    type,
    detail,
    value,
    metadata,
  });
};

const initAbTest = () => {
  localStorage.setItem('abVariant', state.abVariant);
  if (state.abVariant === 'B') {
    selectors.heroHeadline.textContent = 'Unlock a Predictable Pipeline with Offline-Ready Lead Scoring';
    selectors.heroSubhead.textContent = 'Qualify leads with multi-step forms, behavior tracking, and instant sales handoffs—without any cloud dependency.';
  }
};

const restoreDraft = () => {
  const draftData = JSON.parse(localStorage.getItem('draftData') || '{}');
  Object.keys(draftData).forEach((key) => {
    const field = document.querySelector(`[name="${key}"]`);
    if (field) field.value = draftData[key];
  });
  updateConditionalFields();
  updateAiSuggestion();
};

const initTracking = () => {
  trackEvent('page_view', 'landing', 1);

  let scroll50Tracked = false;
  let scroll90Tracked = false;

  window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
    if (!scroll50Tracked && scrollPercent > 0.5) {
      scroll50Tracked = true;
      trackEvent('scroll_50', 'landing', 50);
    }
    if (!scroll90Tracked && scrollPercent > 0.9) {
      scroll90Tracked = true;
      trackEvent('scroll_90', 'landing', 90);
    }
  });

  document.addEventListener('click', (event) => {
    const x = (event.clientX / window.innerWidth).toFixed(2);
    const y = (event.clientY / window.innerHeight).toFixed(2);
    trackEvent('click', 'heatmap', 1, `x:${x},y:${y}`);
  });

  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.round((Date.now() - state.startTime) / 1000);
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': state.csrfToken,
      },
      body: JSON.stringify({
        leadId: state.leadId,
        type: 'time_on_page',
        detail: 'landing',
        value: timeOnPage,
        metadata: '',
      }),
      keepalive: true,
    });
  });
};

const initExitIntent = () => {
  let shown = false;
  document.addEventListener('mouseout', (event) => {
    if (event.clientY <= 0 && !shown) {
      shown = true;
      selectors.exitModal.classList.add('active');
      trackEvent('exit_intent', 'modal', 1);
    }
  });

  selectors.exitClose.addEventListener('click', () => {
    selectors.exitModal.classList.remove('active');
  });

  selectors.exitSubmit.addEventListener('click', async () => {
    const email = selectors.exitEmail.value.trim();
    if (!email) return;
    await apiRequest('/api/lead', {
      email,
      source: 'exit-intent',
      abVariant: state.abVariant,
    });
    selectors.exitModal.classList.remove('active');
  });
};

const initCtas = () => {
  const scrollToForm = () => document.getElementById('form').scrollIntoView({ behavior: 'smooth' });
  selectors.primaryCta.addEventListener('click', () => {
    scrollToForm();
    trackEvent('cta_click', 'primary', 1);
  });
  selectors.secondaryCta.addEventListener('click', () => {
    document.getElementById('benefits').scrollIntoView({ behavior: 'smooth' });
    trackEvent('cta_click', 'secondary', 1);
  });
  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => scrollToForm());
  });
};

const initForm = () => {
  selectors.prevBtn.style.display = 'none';
  showStep(state.step);

  selectors.form.addEventListener('input', () => {
    const data = getFormData();
    localStorage.setItem('draftData', JSON.stringify(data));
    updateConditionalFields();
    updateAiSuggestion();
  });

  selectors.nextBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!validateStep()) return;

    if (!state.formStarted) {
      state.formStarted = true;
      trackEvent('form_start', 'lead-form', 1);
    }

    if (state.step < state.totalSteps) {
      trackEvent('form_step_complete', `step-${state.step}`, 1);
      state.step += 1;
      showStep(state.step);
      return;
    }

    const payload = getFormData();
    const response = await apiRequest('/api/lead', payload);
    if (response.leadId) {
      state.leadId = response.leadId;
      localStorage.setItem('leadId', response.leadId);
      trackEvent('form_submit', 'lead-form', 1);
      selectors.form.reset();
      selectors.form.style.display = 'none';
      selectors.successMessage.style.display = 'block';
      localStorage.removeItem('draftData');
      localStorage.removeItem('draftId');
    }
  });

  selectors.prevBtn.addEventListener('click', () => {
    if (state.step > 1) {
      state.step -= 1;
      showStep(state.step);
    }
  });

  selectors.saveBtn.addEventListener('click', async () => {
    const payload = getFormData();
    const response = await apiRequest('/api/lead/draft', {
      draftId: state.draftId,
      payload,
      lastStep: state.step,
    });
    if (response.draftId) {
      state.draftId = response.draftId;
      localStorage.setItem('draftId', response.draftId);
      alert('Draft saved locally. Come back anytime to finish.');
    }
  });
};

const init = async () => {
  await fetchCsrf();
  initAbTest();
  restoreDraft();
  initTracking();
  initExitIntent();
  initCtas();
  initForm();
};

init();
