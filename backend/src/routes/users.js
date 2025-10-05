const express = require('express');
const router = express.Router();
const { assignRoleToUser, removeRoleFromUser } = require('../controllers/roleController');
const { checkPermission } = require('../middleware/permissions');
const { getUserById, listUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Asignar rol a usuario
router.post('/:id/roles', authenticateToken, checkPermission('manage_users'), async (req, res) => {
  const { roleId } = req.body;
  const userId = req.params.id;
  try {
    // Validar existencia de usuario y rol
    const user = await require('../controllers/userController').getUserByIdRaw(userId);
    if (!user) {
      console.error(`Usuario no encontrado: ${userId}`);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const role = await require('../controllers/roleController').getRoleById(roleId);
    if (!role) {
      console.error(`Rol no encontrado: ${roleId}`);
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    const result = await assignRoleToUser(userId, roleId);
    console.log(`Rol asignado: userId=${userId}, roleId=${roleId}`);
    res.json(result);
  } catch (e) {
    console.error('Error asignando rol:', e);
    res.status(400).json({ error: e.message });
  }
});

// Quitar rol a usuario
router.delete('/:id/roles/:roleId', authenticateToken, checkPermission('manage_users'), async (req, res) => {
  const { id: userId, roleId } = req.params;
  try {
    await removeRoleFromUser(userId, roleId);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


// Todas las rutas requieren autenticación y rol ADMIN
router.get('/', authenticateToken, checkPermission('manage_users'), listUsers);
router.post('/', authenticateToken, checkPermission('manage_users'), createUser);
router.put('/', authenticateToken, checkPermission('manage_users'), updateUser);
router.delete('/', authenticateToken, checkPermission('manage_users'), deleteUser);

module.exports = router;
