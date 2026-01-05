const express = require('express');
const router = express.Router();

const prospectsController = require('../controllers/prospectsController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/', prospectsController.getProspects);
router.get('/stats', prospectsController.getStats);
router.get('/:id', prospectsController.getProspectById);
router.post('/', prospectsController.createProspect);
router.put('/:id', prospectsController.updateProspect);
router.delete('/:id', prospectsController.deleteProspect);

module.exports = router;