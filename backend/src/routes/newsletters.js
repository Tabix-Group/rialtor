const express = require('express');
const router = express.Router();

const newsletterController = require('../controllers/newsletterController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Middleware condicional para subida de imágenes
const conditionalUpload = (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    newsletterController.uploadImages(req, res, next);
  } else {
    next();
  }
};

// Crear nueva newsletter (con subida de imágenes)
router.post('/',
  checkPermission('use_placas'), // Usar el mismo permiso por ahora, o crear uno nuevo
  newsletterController.uploadImages,
  newsletterController.createNewsletter
);

// Obtener newsletters del usuario
router.get('/', newsletterController.getNewsletters);

// Obtener newsletter específica
router.get('/:id', newsletterController.getNewsletterById);

// Actualizar newsletter (con subida opcional de imágenes)
router.put('/:id',
  conditionalUpload,
  newsletterController.updateNewsletter
);

// Eliminar newsletter
router.delete('/:id', newsletterController.deleteNewsletter);

module.exports = router;