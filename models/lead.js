const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Lead', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    company: DataTypes.STRING,
    role: DataTypes.STRING,
    phone: DataTypes.STRING,
    website: DataTypes.STRING,
    niche: DataTypes.STRING,
    painPoint: DataTypes.STRING,
    budget: DataTypes.STRING,
    timeline: DataTypes.STRING,
    goals: DataTypes.TEXT,
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    temperature: {
      type: DataTypes.STRING,
      defaultValue: 'cold',
    },
    source: DataTypes.STRING,
    abVariant: DataTypes.STRING,
  }, {
    timestamps: true,
  });
};
