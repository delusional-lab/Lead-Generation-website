const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Event', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    leadId: DataTypes.STRING,
    type: DataTypes.STRING,
    detail: DataTypes.STRING,
    value: DataTypes.FLOAT,
    metadata: DataTypes.TEXT,
  }, {
    timestamps: true,
  });
};
