const express = require('express');
const router = express.Router();

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
router.post('/rates', authenticateToken, checkPermission('manage_system'), upsertBankRate);
router.delete('/rates/:id', authenticateToken, checkPermission('manage_system'), deleteBankRate);

// Export router
module.exports = router;
