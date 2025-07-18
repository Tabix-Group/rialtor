const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkPermission } = require('../middleware/permissions');

// Obtener todos los permisos
router.get('/', checkPermission('manage_users'), async (req, res) => {
  const permissions = await prisma.permission.findMany();
  res.json(permissions);
});

// Crear un permiso
router.post('/', checkPermission('manage_users'), async (req, res) => {
  const { name, description } = req.body;
  const permission = await prisma.permission.create({ data: { name, description } });
  res.json(permission);
});

// Editar un permiso
router.put('/:id', checkPermission('manage_users'), async (req, res) => {
  const { name, description } = req.body;
  const permission = await prisma.permission.update({
    where: { id: req.params.id },
    data: { name, description },
  });
  res.json(permission);
});

// Eliminar un permiso
router.delete('/:id', checkPermission('manage_users'), async (req, res) => {
  await prisma.permission.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

module.exports = router;
