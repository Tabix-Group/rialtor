const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    // Check if Prisma is available
    if (!prisma) {
      console.log('[AUTH] Prisma not available, skipping authentication');
      return res.status(503).json({ error: 'Database not available' });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    console.log('[AUTH] Authorization header:', authHeader ? 'Present' : 'Missing');
    console.log('[AUTH] JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'NOT SET');
    if (!token) {
      console.log('[AUTH] No token found');
      return res.status(401).json({ error: 'Access token required' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[AUTH] Token decoded successfully for user:', decoded.userId);
    } catch (jwtErr) {
      console.log('[AUTH] JWT error:', jwtErr.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    // Verificar si el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        // role eliminado
        isActive: true,
        avatar: true,
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
      console.log('[AUTH] User not found for id:', decoded.userId);
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (!user.isActive) {
      console.log('[AUTH] User is not active:', user.email);
      return res.status(401).json({ error: 'Account deactivated' });
    }
    if (user.roleAssignments.length === 0) {
      console.log('[AUTH] User has no role assignments:', user.email);
      return res.status(401).json({ error: 'User has no assigned roles' });
    }
    console.log('[AUTH] User authenticated successfully:', user.email);
    console.log('[AUTH] User has', user.roleAssignments.length, 'role assignments');
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};


// Middleware opcional para autenticación
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          // role eliminado
          isActive: true,
          avatar: true,
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

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Si hay error en la autenticación opcional, simplemente continúa sin usuario
    next();
  }
};

// Middleware para autorizar roles específicos
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = req.user.roleAssignments?.map(ra => ra.role.name) || [];

    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorizeRoles
};
