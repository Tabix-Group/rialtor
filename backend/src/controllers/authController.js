const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async (req, res, next) => {
  try {
    const { email, password, name, phone, office, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        office,
        // role eliminado, ahora se asigna por roleAssignments
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        office: true,
        // role eliminado
        avatar: true,
        createdAt: true
      }
    });

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
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
        password: true, // necesario para comparar
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

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated'
      });
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generar token
    const token = generateToken(user.id);

    // Mapear roles igual que en userController y quitar password
    const { password: _, ...userSafe } = user;
    const userWithRoles = {
      ...userSafe,
      roles: user.roleAssignments.map(ra => ({
        id: ra.role.id,
        name: ra.role.name,
        permissions: ra.role.permissions.map(p => p.name)
      }))
    };
    res.json({
      message: 'Login successful',
      user: userWithRoles,
      token
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
    const userWithRoles = {
      ...user,
      roles: user.roleAssignments.map(ra => ({
        id: ra.role.id,
        name: ra.role.name,
        permissions: ra.role.permissions.map(p => p.name)
      }))
    };
    res.json({
      message: 'User profile retrieved successfully',
      user: userWithRoles
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        name: true,
        // role eliminado
        avatar: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Obtener el usuario actual
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found'
      });
    }

    // Verificar la contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Invalid current password',
        message: 'Current password is incorrect'
      });
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar la contraseña
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Verificar que el usuario sigue existiendo y está activo
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        // role eliminado
        avatar: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid user',
        message: 'User not found or deactivated'
      });
    }

    // Generar nuevo token
    const token = generateToken(user.id);

    res.json({
      message: 'Token refreshed successfully',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

const debugToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.json({
        valid: false,
        error: 'No token provided',
        headers: req.headers,
        timestamp: new Date().toISOString()
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true
        }
      });

      res.json({
        valid: true,
        decoded,
        user: user ? { id: user.id, email: user.email, name: user.name, isActive: user.isActive } : null,
        timestamp: new Date().toISOString()
      });
    } catch (jwtErr) {
      res.json({
        valid: false,
        error: jwtErr.message,
        tokenLength: token.length,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.json({
      valid: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  debugToken
};
