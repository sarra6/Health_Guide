const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HealthProfile = sequelize.define('HealthProfile', {
  id:                { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:            { type: DataTypes.UUID, allowNull: false, unique: true, references: { model: 'users', key: 'id' } },
  bloodType:         { type: DataTypes.ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'), defaultValue: 'Unknown' },
  height:            { type: DataTypes.DECIMAL(5,1), allowNull: true },  // cm
  weight:            { type: DataTypes.DECIMAL(5,1), allowNull: true },  // kg
  allergies:         { type: DataTypes.JSON, defaultValue: [] },         // array of strings
  chronicConditions: { type: DataTypes.JSON, defaultValue: [] },
  familyHistory:     { type: DataTypes.JSON, defaultValue: [] },
  smokingStatus:     { type: DataTypes.ENUM('never','former','current'), defaultValue: 'never' },
  alcoholUse:        { type: DataTypes.ENUM('none','occasional','moderate','heavy'), defaultValue: 'none' },
  exerciseFrequency: { type: DataTypes.ENUM('none','1-2/week','3-4/week','5+/week'), defaultValue: 'none' },
  emergencyContact:  { type: DataTypes.STRING(200), allowNull: true },
  emergencyPhone:    { type: DataTypes.STRING(30), allowNull: true },
  insuranceProvider: { type: DataTypes.STRING(100), allowNull: true },
  notes:             { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'health_profiles', timestamps: true });

module.exports = HealthProfile;
