const express = require('express');
const router = express.Router();
const indicatorsController = require('../controllers/indicatorsController');
const { authenticate } = require('../middleware/auth');
const { checkPermissions } = require('../middleware/permissions');

/**
 * @route   GET /api/indicators/dolar
 * @desc    Obtiene las cotizaciones del dólar (público)
 * @access  Public
 */
router.get('/dolar', indicatorsController.getDolarRates);

/**
 * @route   GET /api/indicators/real-estate
 * @desc    Obtiene datos del mercado inmobiliario (público)
 * @access  Public
 */
router.get('/real-estate', indicatorsController.getRealEstateData);

/**
 * @route   GET /api/indicators/all
 * @desc    Obtiene todos los indicadores
 * @access  Public
 */
router.get('/all', indicatorsController.getAllIndicators);

/**
 * @route   POST /api/indicators/clear-cache
 * @desc    Limpia el cache de indicadores
 * @access  Private (Admin only)
 */
router.post('/clear-cache', authenticate, checkPermissions(['manage_system']), indicatorsController.clearCache);

module.exports = router;
