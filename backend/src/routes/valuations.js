const express = require('express');
const router = express.Router();

const valuationController = require('../controllers/valuationController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET todas las valuaciones del usuario (con paginación)
router.get('/', valuationController.getValuations);

// GET una valuación específica
router.get('/:id', valuationController.getValuationById);

// POST crear nueva valuación
router.post('/', valuationController.createValuation);

// DELETE eliminar una valuación
router.delete('/:id', valuationController.deleteValuation);

module.exports = router;
