const express = require('express');
const router = express.Router();

const plaqueController = require('../controllers/plaqueController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Crear nueva placa (con subida de imágenes)
router.post('/', 
  checkPermission('use_placas'), // Nuevo permiso específico
  plaqueController.upload, // Middleware de multer
  plaqueController.createPropertyPlaque
);

// Obtener placas del usuario
router.get('/', plaqueController.getUserPlaques);

// Obtener placa específica
router.get('/:id', plaqueController.getPlaqueById);

// Eliminar placa
router.delete('/:id', plaqueController.deletePlaque);

module.exports = router;
