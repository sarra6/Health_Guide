const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AIReport = sequelize.define('AIReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  inputType: {
    type: DataTypes.ENUM('chat', 'image', 'vitals', 'symptoms'),
    allowNull: false
  },
  inputData:          { type: DataTypes.JSON, allowNull: true },
  prediction:         { type: DataTypes.TEXT, allowNull: true },
  confidenceScore:    { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  recommendation:     { type: DataTypes.TEXT, allowNull: true },
  riskLevel: {
    type: DataTypes.ENUM('low', 'moderate', 'high', 'critical'),
    allowNull: true
  },
  specialistReferral: { type: DataTypes.STRING(100), allowNull: true },
  followUpRequired:   { type: DataTypes.BOOLEAN, defaultValue: false },
  reviewedByDoctor:   { type: DataTypes.BOOLEAN, defaultValue: false },
  doctorId:           { type: DataTypes.UUID, allowNull: true },
  doctorNotes:        { type: DataTypes.TEXT, allowNull: true },
  disclaimer: {
    type: DataTypes.TEXT,
    defaultValue: 'This AI analysis is for informational purposes only and does not replace professional medical diagnosis. Please consult a qualified healthcare provider.'
  }
}, {
  tableName: 'ai_reports',
  timestamps: true
});

module.exports = AIReport;
