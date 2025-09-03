const express = require('express');
const router = express.Router();

const { getStats } = require('../controllers/adminController');
const { getBankRates, upsertBankRate, deleteBankRate } = require('../controllers/rateController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Estadísticas para dashboard de administración
router.get('/stats', authenticateToken, checkPermission('view_admin'), getStats);

// Tasas bancarias
router.get('/rates', authenticateToken, checkPermission('view_admin'), getBankRates);
router.post('/rates', authenticateToken, checkPermission('manage_system'), upsertBankRate);
router.delete('/rates/:id', authenticateToken, checkPermission('manage_system'), deleteBankRate);

// Export router
module.exports = router;
