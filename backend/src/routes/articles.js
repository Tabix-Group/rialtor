const express = require('express');
const router = express.Router();

const {
  getArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateArticle } = require('../middleware/validation');

// Public routes
router.get('/', getArticles);
router.get('/:id', getArticleById);
router.get('/slug/:slug', getArticleBySlug);

// Protected routes
router.post('/', authenticateToken, validateArticle.create, createArticle);
router.put('/:id', authenticateToken, validateArticle.update, updateArticle);
router.delete('/:id', authenticateToken, deleteArticle);

module.exports = router;
