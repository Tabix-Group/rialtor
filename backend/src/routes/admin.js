const express = require('express');
const router = express.Router();

const { getStats } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Estadísticas para dashboard de administración
router.get('/stats', authenticateToken, checkPermission('view_admin'), getStats);

// Export router
module.exports = router;
