// Obtener rol por id (para validación interna)
async function getRoleById(id) {
  return prisma.role.findUnique({ where: { id } });
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Asignar roles a usuarios
async function assignRoleToUser(userId, roleId) {
  return prisma.roleAssignment.upsert({
    where: { userId_roleId: { userId, roleId } },
    update: {},
    create: { userId, roleId },
  });
}

// Quitar rol de usuario
async function removeRoleFromUser(userId, roleId) {
  return prisma.roleAssignment.delete({
    where: { userId_roleId: { userId, roleId } },
  });
}

// Obtener roles de un usuario
async function getUserRoles(userId) {
  const assignments = await prisma.roleAssignment.findMany({
    where: { userId },
    include: { role: { include: { permissions: true } } },
  });
  return assignments.map(a => a.role);
}

module.exports = {
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getRoleById
};
