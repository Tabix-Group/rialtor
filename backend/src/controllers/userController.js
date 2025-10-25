// Obtener usuario sin formatear (para validación interna)
const getUserByIdRaw = async (id) => {
  return prisma.user.findUnique({ where: { id } });
};
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// List all users or get individual user by query id
const listUsers = async (req, res, next) => {
  try {
    if (req.query.id) {
      // Get individual user
      const { id } = req.query;
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          office: true,
          avatar: true,
          isActive: true,
          updatedAt: true,
          roleAssignments: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  permissions: { select: { name: true } }
                }
              }
            }
          }
        }
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      const userWithRoles = {
        ...user,
        roles: user.roleAssignments.map(ra => ({
          id: ra.role.id,
          name: ra.role.name,
          permissions: ra.role.permissions.map(p => p.name)
        }))
      };
      return res.json({ user: userWithRoles });
    }
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        office: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        roleAssignments: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: { select: { name: true } }
              }
            }
          }
        }
      }
    });
    // Mapear a estructura roles: [{id, name, permissions: [string]}]
    const usersWithRoles = users.map(u => ({
      ...u,
      roles: u.roleAssignments.map(ra => ({
        id: ra.role.id,
        name: ra.role.name,
        permissions: ra.role.permissions.map(p => p.name)
      }))
    }));
    res.json({ users: usersWithRoles });
  } catch (error) {
    next(error);
  }
};

// Create a new user (admin only)
const createUser = async (req, res, next) => {
  try {
    const { email, password, name, phone, office, roles } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        office,
        isActive: true
      }
    });
    // Asignar roles si se envían, si no, asignar rol USUARIO por defecto
    let assignedRoles = roles;
    if (!Array.isArray(roles) || roles.length === 0) {
      // Buscar el rol USUARIO
      const userRole = await prisma.role.findFirst({ where: { name: 'USUARIO' } });
      if (userRole) assignedRoles = [userRole.id];
    }
    if (Array.isArray(assignedRoles) && assignedRoles.length > 0) {
      for (const roleId of assignedRoles) {
        await prisma.roleAssignment.upsert({
          where: { userId_roleId: { userId: user.id, roleId } },
          update: {},
          create: { userId: user.id, roleId }
        });
      }
    }
    // Traer usuario con roles asignados
    const userWithRoles = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        office: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        roleAssignments: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: { select: { name: true } }
              }
            }
          }
        }
      }
    });
    res.status(201).json({
      user: {
        ...userWithRoles,
        roles: userWithRoles.roleAssignments.map(ra => ({
          id: ra.role.id,
          name: ra.role.name,
          permissions: ra.role.permissions.map(p => p.name)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin only)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.query;
    const { name, phone, office, role, isActive, password } = req.body;
    let updateData = {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(office && { office }),
      ...(typeof isActive === 'boolean' && { isActive })
    };
    if (password && password.length > 0) {
      updateData.password = await bcrypt.hash(password, 12);
    }
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        office: true,
        avatar: true,
        isActive: true,
        updatedAt: true,
        roleAssignments: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: { select: { name: true } }
              }
            }
          }
        }
      }
    });
    const userWithRoles = {
      ...user,
      roles: user.roleAssignments.map(ra => ({
        id: ra.role.id,
        name: ra.role.name,
        permissions: ra.role.permissions.map(p => p.name)
      }))
    };
    res.json({ user: userWithRoles });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.query;

    // Eliminar todas las dependencias del usuario en orden correcto
    // Primero eliminar elementos que dependen de otros elementos

    // 1. Eliminar comentarios (dependen de artículos)
    await prisma.comment.deleteMany({ where: { authorId: id } });

    // 2. Eliminar attachments (dependen de artículos)
    await prisma.attachment.deleteMany({ where: { article: { authorId: id } } });

    // 3. Eliminar artículos
    await prisma.article.deleteMany({ where: { authorId: id } });

    // 4. Eliminar mensajes de chat (dependen de sesiones)
    await prisma.chatMessage.deleteMany({ where: { session: { userId: id } } });

    // 5. Eliminar sesiones de chat
    await prisma.chatSession.deleteMany({ where: { userId: id } });

    // 6. Eliminar solicitudes de documentos
    await prisma.documentRequest.deleteMany({ where: { userId: id } });

    // 7. Eliminar plantillas de documentos
    await prisma.documentTemplate.deleteMany({ where: { userId: id } });

    // 8. Eliminar historial de calculadoras
    await prisma.calculatorHistory.deleteMany({ where: { userId: id } });

    // 9. Eliminar placas de propiedades
    await prisma.propertyPlaque.deleteMany({ where: { userId: id } });

    // 10. Eliminar archivos subidos (usa uploadedBy en lugar de userId)
    await prisma.fileUpload.deleteMany({ where: { uploadedBy: id } });

    // 11. Eliminar transacciones financieras
    await prisma.financeTransaction.deleteMany({ where: { userId: id } });

    // 12. Eliminar favoritos de documentos
    await prisma.documentFavorite.deleteMany({ where: { userId: id } });

    // 13. Eliminar token de calendario
    await prisma.calendarToken.deleteMany({ where: { userId: id } });

    // 14. Eliminar asignaciones de roles
    await prisma.roleAssignment.deleteMany({ where: { userId: id } });

    // Finalmente eliminar el usuario
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserByIdRaw
};
