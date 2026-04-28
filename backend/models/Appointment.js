const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:       { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
  doctorId:     { type: DataTypes.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
  doctorName:   { type: DataTypes.STRING(200), allowNull: false },
  specialty:    { type: DataTypes.STRING(100) },
  date:         { type: DataTypes.DATE, allowNull: false },
  location:     { type: DataTypes.STRING(300), allowNull: true },
  notes:        { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('upcoming', 'completed', 'cancelled'),
    defaultValue: 'upcoming'
  },
  reminderSent: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'appointments', timestamps: true });

module.exports = Appointment;
