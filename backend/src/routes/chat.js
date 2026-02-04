const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');
const { validateChat } = require('../middleware/validation');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Gestión de sesiones
router.post('/sessions', chatController.createChatSession);
router.get('/sessions', chatController.getChatSessions);
router.get('/sessions/:sessionId', chatController.getChatSession);
router.put('/sessions/:sessionId', chatController.updateChatSession);
router.delete('/sessions/:sessionId', chatController.deleteChatSession);

// Envío de mensajes
router.post('/message', validateChat.message, chatController.sendMessage);

// Ayuda de la plataforma (especializado)
router.post('/help', chatController.processHelpChat);

// Feedback de mensajes
router.post('/feedback', chatController.sendFeedback);

module.exports = router;
