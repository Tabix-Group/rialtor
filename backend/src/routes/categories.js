const express = require('express');
const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected routes (admin only)
router.post('/', authenticateToken, checkPermission('manage_categories'), createCategory);
router.put('/:id', authenticateToken, checkPermission('manage_categories'), updateCategory);
router.delete('/:id', authenticateToken, checkPermission('manage_categories'), deleteCategory);

module.exports = router;
