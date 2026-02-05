const classifyTemperature = (score) => {
  if (score >= 80) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
};

const scoreRules = {
  page_view: 2,
  scroll_50: 5,
  scroll_90: 8,
  cta_click: 8,
  form_start: 10,
  form_step_complete: 12,
  form_submit: 30,
  exit_intent: 4,
  time_on_page: 1,
};

const calculateScoreDelta = ({ type, value }) => {
  const base = scoreRules[type] || 0;
  if (type === 'time_on_page') {
    return Math.min(15, Math.floor(value / 10));
  }
  return base;
};

module.exports = {
  classifyTemperature,
  calculateScoreDelta,
};
