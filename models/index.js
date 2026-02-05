const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'leadgen.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
});

const Lead = require('./lead')(sequelize);
const LeadDraft = require('./leadDraft')(sequelize);
const Event = require('./event')(sequelize);

Lead.hasMany(Event, { foreignKey: 'leadId', onDelete: 'CASCADE' });
Event.belongsTo(Lead, { foreignKey: 'leadId' });

module.exports = {
  sequelize,
  Lead,
  LeadDraft,
  Event,
};
