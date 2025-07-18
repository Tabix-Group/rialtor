// Obtener usuario sin formatear (para validación interna)
const getUserByIdRaw = async (id) => {
  return prisma.user.findUnique({ where: { id } });
};
// Obtener usuario individual con roles y permisos
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
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
    res.json({ user: userWithRoles });
  } catch (error) {
    next(error);
  }
};
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// List all users
const listUsers = async (req, res, next) => {
  try {
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
    // Asignar roles si se envían
    if (Array.isArray(roles) && roles.length > 0) {
      for (const roleId of roles) {
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
    const { id } = req.params;
    const { name, phone, office, role, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(office && { office }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
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
    const { id } = req.params;
    // Eliminar primero los roleAssignments
    await prisma.roleAssignment.deleteMany({ where: { userId: id } });
    // Luego eliminar el usuario
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
  getUserById,
  getUserByIdRaw
};
