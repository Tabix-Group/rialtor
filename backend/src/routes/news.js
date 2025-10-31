const express = require('express');
const router = express.Router();

const {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    getAllNewsAdmin,
    getCategories,
    syncRSSFeed,
    cleanOldNewsItems,
    getNewsStats
} = require('../controllers/newsController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateNews } = require('../middleware/validation');

// Public routes
router.get('/', getNews);
router.get('/:id', getNewsById);
router.get('/categories/all', getCategories);

// Admin routes
router.get('/admin/all', authenticateToken, authorizeRoles('ADMIN'), getAllNewsAdmin);
router.get('/stats', authenticateToken, authorizeRoles('ADMIN'), getNewsStats);
router.post('/sync', authenticateToken, authorizeRoles('ADMIN'), syncRSSFeed);
router.post('/clean-old', authenticateToken, authorizeRoles('ADMIN'), cleanOldNewsItems);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), validateNews.create, createNews);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), validateNews.update, updateNews);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteNews);

module.exports = router;
