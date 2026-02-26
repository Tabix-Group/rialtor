const express = require('express');
const router = express.Router();

const decoralaController = require('../controllers/decoralaController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Autenticación requerida para todas las rutas
router.use(authenticateToken);

// Crear nueva solicitud de decoración
router.post(
  '/',
  checkPermission('use_decorala'),
  decoralaController.upload,
  decoralaController.createDecoration
);

// Listar decoraciones del usuario
router.get('/', decoralaController.getDecorations);

// Obtener decoración por ID (para polling)
router.get('/:id', decoralaController.getDecorationById);

// Eliminar decoración
router.delete('/:id', decoralaController.deleteDecoration);

module.exports = router;
