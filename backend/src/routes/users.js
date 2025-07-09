const express = require('express');
const router = express.Router();


const { listUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Todas las rutas requieren autenticación y rol ADMIN
router.get('/', authenticateToken, authorizeRoles('ADMIN'), listUsers);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createUser);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteUser);

module.exports = router;
