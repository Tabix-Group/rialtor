const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware para verificar permisos
function checkPermission(permission) {
  return async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleAssignments: {
          include: {
            role: { include: { permissions: true } },
          },
        },
      },
    });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    const userPerms = user.roleAssignments.flatMap(ra => ra.role.permissions.map(p => p.name));
    if (!userPerms.includes(permission)) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }
    next();
  };
}

module.exports = { checkPermission };
