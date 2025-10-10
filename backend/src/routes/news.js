const express = require('express');
const router = express.Router();

const {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    getAllNewsAdmin,
    getCategories
} = require('../controllers/newsController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateNews } = require('../middleware/validation');

// Public routes
router.get('/', getNews);
router.get('/:id', getNewsById);
router.get('/categories/all', getCategories);

// Admin routes
router.get('/admin/all', authenticateToken, authorizeRoles('ADMIN'), getAllNewsAdmin);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), validateNews.create, createNews);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), validateNews.update, updateNews);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteNews);

module.exports = router;
