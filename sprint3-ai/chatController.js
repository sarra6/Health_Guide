const { v4: uuidv4 } = require('uuid');
const ChatHistory = require('../models/ChatHistory');
const { generateChatResponse } = require('../services/smartAssistantService');
const { triageSymptoms } = require('../services/recommendationService');

exports.startSession = async (req, res) => {
  try {
    const sessionId = uuidv4();
    const session = await ChatHistory.create({
      userId: req.user.id,
      sessionId,
      title: req.body.title || 'Health Consultation',
      category: req.body.category || 'general',
      messages: []
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message, healthContext } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ error: 'sessionId and message are required.' });
    }

    const session = await ChatHistory.findOne({ where: { sessionId, userId: req.user.id } });
    if (!session) return res.status(404).json({ error: 'Chat session not found.' });

    const triage = triageSymptoms([message]);

    const messages = session.messages || [];
    messages.push({ role: 'user', content: message, timestamp: new Date() });

    const aiResult = await generateChatResponse(req.user.id, message, messages.slice(-10), healthContext);

    messages.push({ role: 'assistant', content: aiResult.response, timestamp: new Date() });
    await session.update({ messages });

    res.json({
      response: aiResult.response,
      triage,
      sessionId,
      messageCount: messages.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatHistory.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(sessions.map(s => ({
      ...s.toJSON(),
      messageCount: (s.messages || []).length,
      lastMessage: (s.messages || []).slice(-1)[0]?.content?.substring(0, 100)
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSessionHistory = async (req, res) => {
  try {
    const session = await ChatHistory.findOne({
      where: { sessionId: req.params.sessionId, userId: req.user.id }
    });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.closeSession = async (req, res) => {
  try {
    await ChatHistory.update(
      { resolved: true },
      { where: { sessionId: req.params.sessionId, userId: req.user.id } }
    );
    res.json({ message: 'Session closed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

