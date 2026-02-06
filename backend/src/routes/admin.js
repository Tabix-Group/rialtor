const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const { getStats } = require('../controllers/adminController');
const { getBankRates, upsertBankRate, deleteBankRate } = require('../controllers/rateController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Estadísticas para dashboard de administración
router.get('/stats', authenticateToken, checkPermission('view_admin'), getStats);

// Debug endpoint para verificar permisos
router.get('/debug-permissions', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                roleAssignments: {
                    include: {
                        role: { include: { permissions: true } },
                    },
                },
            },
        });

        const userPerms = user.roleAssignments.flatMap(ra => ra.role.permissions.map(p => p.name));

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                roles: user.roleAssignments.map(ra => ({
                    id: ra.role.id,
                    name: ra.role.name,
                    permissions: ra.role.permissions.map(p => p.name)
                }))
            },
            permissions: userPerms
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Debug endpoint para verificar permisos (temporal)
router.get('/debug-permissions-no-auth', async (req, res) => {
    try {
        // Para testing, permitir sin auth por ahora
        const userId = req.query.userId; // Pasar userId como query param para testing
        if (!userId) {
            return res.json({ error: 'userId required for testing' });
        }

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
            return res.json({ error: 'User not found' });
        }

        const userPerms = user.roleAssignments.flatMap(ra => ra.role.permissions.map(p => p.name));

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                roles: user.roleAssignments.map(ra => ({
                    id: ra.role.id,
                    name: ra.role.name,
                    permissions: ra.role.permissions.map(p => p.name)
                }))
            },
            permissions: userPerms,
            hasViewAdmin: userPerms.includes('view_admin'),
            hasManageUsers: userPerms.includes('manage_users')
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Tasas bancarias sin requerir permisos para testing
router.get('/rates-test', async (req, res) => {
    try {
        console.log('[ADMIN] Getting bank rates for testing...');
        const rates = await prisma.bankRate.findMany({
            where: { isActive: true },
            orderBy: { bankName: 'asc' }
        });

        console.log(`[ADMIN] Found ${rates.length} bank rates`);
        res.json({
            success: true,
            data: rates,
            count: rates.length
        });
    } catch (error) {
        console.error('[ADMIN] Error getting bank rates:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tasas bancarias',
            error: error.message
        });
    }
});

// Tasas bancarias
router.get('/rates', authenticateToken, checkPermission('view_admin'), getBankRates);
router.post('/rates', authenticateToken, checkPermission('view_admin'), upsertBankRate);
router.delete('/rates/:id', authenticateToken, checkPermission('view_admin'), deleteBankRate);

// Índices económicos
router.get('/economic-indices', authenticateToken, checkPermission('view_admin'), async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const indices = await prisma.economicIndex.findMany({
      orderBy: [
        { indicator: 'asc' },
        { date: 'desc' }
      ]
    });
    
    await prisma.$disconnect();
    res.json({ success: true, data: indices });
  } catch (error) {
    console.error('Error getting economic indices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/economic-indices', authenticateToken, checkPermission('view_admin'), async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const { indicator, value, date, description } = req.body;
    
    if (!indicator || !value || !date) {
      return res.status(400).json({ success: false, error: 'Indicador, valor y fecha son requeridos' });
    }
    
    // Verificar que no exista ya un registro para este indicador en esta fecha
    const existing = await prisma.economicIndex.findUnique({
      where: {
        indicator_date: {
          indicator,
          date: new Date(date)
        }
      }
    });
    
    if (existing) {
      await prisma.$disconnect();
      return res.status(400).json({ success: false, error: 'Ya existe un valor para este indicador en esta fecha' });
    }
    
    const newIndex = await prisma.economicIndex.create({
      data: {
        indicator,
        value: parseFloat(value),
        date: new Date(date),
        description: description || null
      }
    });
    
    await prisma.$disconnect();
    res.json({ success: true, data: newIndex });
  } catch (error) {
    console.error('Error creating economic index:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/economic-indices/:id', authenticateToken, checkPermission('view_admin'), async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const { id } = req.params;
    const { value, description } = req.body;
    
    const updatedIndex = await prisma.economicIndex.update({
      where: { id },
      data: {
        value: value ? parseFloat(value) : undefined,
        description: description !== undefined ? description : undefined
      }
    });
    
    await prisma.$disconnect();
    res.json({ success: true, data: updatedIndex });
  } catch (error) {
    console.error('Error updating economic index:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/economic-indices/:id', authenticateToken, checkPermission('view_admin'), async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.economicIndex.delete({
      where: { id: req.params.id }
    });
    
    await prisma.$disconnect();
    res.json({ success: true, message: 'Índice económico eliminado' });
  } catch (error) {
    console.error('Error deleting economic index:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export router
module.exports = router;
