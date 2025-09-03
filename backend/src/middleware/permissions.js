const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware para verificar permisos
function checkPermission(permission) {
  return async (req, res, next) => {
    console.log(`[PERMISSIONS] Checking permission: ${permission}`);
    const userId = req.user?.id;
    if (!userId) {
      console.log('[PERMISSIONS] No user ID found');
      return res.status(401).json({ error: 'No autenticado' });
    }

    console.log(`[PERMISSIONS] User ID: ${userId}`);
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

    if (!user) {
      console.log('[PERMISSIONS] User not found');
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const userPerms = user.roleAssignments.flatMap(ra => ra.role.permissions.map(p => p.name));
    console.log(`[PERMISSIONS] User permissions:`, userPerms);
    console.log(`[PERMISSIONS] Checking for permission: ${permission}`);
    console.log(`[PERMISSIONS] Has permission: ${userPerms.includes(permission)}`);

    if (!userPerms.includes(permission)) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }
    next();
  };
}

module.exports = { checkPermission };
