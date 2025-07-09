const express = require('express');
const router = express.Router();

const { getStats } = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Estadísticas para dashboard de administración
router.get('/stats', authenticateToken, authorizeRoles('ADMIN'), getStats);

// Export router
module.exports = router;
