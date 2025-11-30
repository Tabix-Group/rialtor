const express = require('express');
const router = express.Router();

const calculatorController = require('../controllers/calculatorController');
const { authenticateToken } = require('../middleware/auth');
const { validateCalculator } = require('../middleware/validation');

// Rutas públicas
router.get('/configs', calculatorController.getCalculatorConfigs);
router.get('/provincias', calculatorController.getProvincias);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

// Cálculos
router.post('/commission', validateCalculator.commission, calculatorController.calculateCommission);
router.post('/taxes', validateCalculator.taxes, calculatorController.calculateTaxes);
router.post('/escribano', calculatorController.calculateEscribano);
router.post('/otros-gastos', calculatorController.calculateOtrosGastos);
router.post('/ganancias', calculatorController.calculateGananciaInmobiliaria);
router.post('/mortgage', calculatorController.calculateMortgage);
router.post('/days', calculatorController.calculateDays);
router.post('/rent', calculatorController.calculateRent);

// Historial
router.get('/history', calculatorController.getCalculatorHistory);

module.exports = router;
