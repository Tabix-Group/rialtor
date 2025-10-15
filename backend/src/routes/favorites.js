const express = require('express');
const router = express.Router();

const {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkFavorite
} = require('../controllers/favoritesController');

const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Agregar documento a favoritos
router.post('/', addFavorite);

// Obtener todos los favoritos del usuario
router.get('/', getFavorites);

// Verificar si un documento está en favoritos
router.get('/check/:documentId(*)', checkFavorite);

// Remover documento de favoritos
router.delete('/:documentId(*)', removeFavorite);

module.exports = router;