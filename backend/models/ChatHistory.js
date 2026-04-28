const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ChatHistory = sequelize.define('ChatHistory', {
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
  sessionId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(200),
    defaultValue: 'Health Consultation'
  },
  messages: {
    type: DataTypes.JSON,   // array of { role, content, timestamp }
    defaultValue: []
  },
  category: {
    type: DataTypes.ENUM('symptom-check', 'medication', 'general', 'emergency', 'follow-up'),
    defaultValue: 'general'
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'chat_history',
  timestamps: true
});

module.exports = ChatHistory;
