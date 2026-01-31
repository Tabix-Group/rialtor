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
          requiresSubscription: true,
          subscriptionStatus: true,
          subscriptionPlanType: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
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
        requiresSubscription: true,
        subscriptionStatus: true,
        subscriptionPlanType: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
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
        isActive: true,
        requiresSubscription: false // Usuarios creados por admin NO requieren suscripción
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

    // Con las cascadas configuradas en Prisma, solo necesitamos eliminar el usuario
    // Todo lo relacionado se eliminará automáticamente
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
