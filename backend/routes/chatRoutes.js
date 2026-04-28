const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/session', chatController.startSession);
router.post('/message', chatController.sendMessage);
router.get('/sessions', chatController.getChatSessions);
router.get('/session/:sessionId', chatController.getSessionHistory);
router.patch('/session/:sessionId/close', chatController.closeSession);

module.exports = router;
