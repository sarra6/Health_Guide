const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Medication = sequelize.define('Medication', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  name:      { type: DataTypes.STRING(200), allowNull: false },
  dosage:    { type: DataTypes.STRING(100) },
  frequency: { type: DataTypes.STRING(100) }, // e.g. "twice daily"
  startDate: { type: DataTypes.DATEONLY },
  endDate:   { type: DataTypes.DATEONLY, allowNull: true },
  notes:     { type: DataTypes.TEXT, allowNull: true },
  active:    { type: DataTypes.BOOLEAN, defaultValue: true },
  takenToday:{ type: DataTypes.BOOLEAN, defaultValue: false },
  lastTaken: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'medications', timestamps: true });

module.exports = Medication;
