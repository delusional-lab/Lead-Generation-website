const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('LeadDraft', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lastStep: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  }, {
    timestamps: true,
  });
};
