const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HealthData = sequelize.define('HealthData', {
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
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // Vitals
  bloodPressureSystolic:  { type: DataTypes.INTEGER, allowNull: true },
  bloodPressureDiastolic: { type: DataTypes.INTEGER, allowNull: true },
  heartRate:              { type: DataTypes.INTEGER, allowNull: true },
  temperature:            { type: DataTypes.DECIMAL(4, 1), allowNull: true },
  oxygenSaturation:       { type: DataTypes.DECIMAL(4, 1), allowNull: true },
  weight:                 { type: DataTypes.DECIMAL(5, 1), allowNull: true },
  height:                 { type: DataTypes.DECIMAL(5, 1), allowNull: true },
  bmi:                    { type: DataTypes.DECIMAL(4, 1), allowNull: true },
  // Blood work
  glucose:                { type: DataTypes.DECIMAL(6, 1), allowNull: true },
  cholesterol:            { type: DataTypes.DECIMAL(6, 1), allowNull: true },
  hemoglobin:             { type: DataTypes.DECIMAL(4, 1), allowNull: true },
  whiteBloodCells:        { type: DataTypes.DECIMAL(6, 2), allowNull: true },
  // Other
  symptoms:    { type: DataTypes.JSON, allowNull: true },    // stored as JSON array
  medications: { type: DataTypes.JSON, allowNull: true },   // stored as JSON array
  notes:       { type: DataTypes.TEXT, allowNull: true },
  riskLevel: {
    type: DataTypes.ENUM('low', 'moderate', 'high', 'critical'),
    defaultValue: 'low'
  }
}, {
  tableName: 'health_data',
  timestamps: true,
  hooks: {
    beforeCreate: (record) => calculateBMI(record),
    beforeUpdate: (record) => calculateBMI(record)
  }
});

function calculateBMI(record) {
  if (record.weight && record.height) {
    const heightM = record.height / 100;
    record.bmi = parseFloat((record.weight / (heightM * heightM)).toFixed(1));
  }
}

module.exports = HealthData;
