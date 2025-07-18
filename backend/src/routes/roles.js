const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkPermission } = require('../middleware/permissions');

// Obtener todos los roles
const { authenticateToken } = require('../middleware/auth');
// Permitir a cualquier usuario autenticado ver los roles (para el modal de usuarios)
router.get('/', authenticateToken, async (req, res) => {
  const roles = await prisma.role.findMany({ include: { permissions: true } });
  res.json(roles);
});

// Crear un nuevo rol
router.post('/', checkPermission('manage_users'), async (req, res) => {
  const { name, description, permissions } = req.body;
  const role = await prisma.role.create({
    data: {
      name,
      description,
      permissions: { connect: permissions.map(id => ({ id })) },
    },
    include: { permissions: true },
  });
  res.json(role);
});

// Editar un rol
router.put('/:id', checkPermission('manage_users'), async (req, res) => {
  const { name, description, permissions } = req.body;
  const role = await prisma.role.update({
    where: { id: req.params.id },
    data: {
      name,
      description,
      permissions: { set: permissions.map(id => ({ id })) },
    },
    include: { permissions: true },
  });
  res.json(role);
});

// Eliminar un rol
router.delete('/:id', checkPermission('manage_users'), async (req, res) => {
  await prisma.role.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;
