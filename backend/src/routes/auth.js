const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateAuth } = require('../middleware/validation');

// Rutas públicas
router.post('/register', validateAuth.register, authController.register);
router.post('/login', validateAuth.login, authController.login);

// Rutas protegidas
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/password', authenticateToken, authController.changePassword);
router.post('/refresh', authenticateToken, authController.refreshToken);

// Debug endpoint para verificar tokens
router.get('/debug', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  res.json({
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL
  });
});
