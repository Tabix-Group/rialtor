const express = require('express');
const router = express.Router();
const indicatorsController = require('../controllers/indicatorsController');
// No usar middleware de permisos por ahora
// const { authenticate } = require('../middleware/auth');
// const { checkPermission } = require('../middleware/permissions');

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
 * @route   GET /api/indicators/economic-indexes
 * @desc    Obtiene índices económicos de Argentina
 * @access  Public
 */
router.get('/economic-indexes', indicatorsController.getEconomicIndexes);

/**
 * @route   GET /api/indicators/economic-indexes/:indicator/chart
 * @desc    Obtiene datos históricos de un índice para gráficos
 * @access  Public
 */
router.get('/economic-indexes/:indicator/chart', indicatorsController.getEconomicIndexChart);

/**
 * @route   GET /api/indicators/dollar/:dollarType/chart
 * @desc    Obtiene datos históricos de cotizaciones del dólar para gráficos
 * @access  Public
 */
router.get('/dollar/:dollarType/chart', indicatorsController.getDollarChart);

/**
 * @route   POST /api/indicators/clear-cache
 * @desc    Limpia el cache de indicadores
 * @access  Public (temporalmente sin autenticación)
 */
router.post('/clear-cache', indicatorsController.clearCache);

module.exports = router;
