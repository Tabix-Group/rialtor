const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todas las tasas bancarias
const getBankRates = async (req, res) => {
    try {
        const rates = await prisma.bankRate.findMany({
            where: { isActive: true },
            orderBy: { bankName: 'asc' }
        });

        res.json({
            success: true,
            data: rates
        });
    } catch (error) {
        console.error('Error getting bank rates:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tasas bancarias',
            error: error.message
        });
    }
};

// Crear o actualizar tasa bancaria
const upsertBankRate = async (req, res) => {
    try {
        const { bankName, interestRate, termMonths } = req.body;

        if (!bankName || interestRate === undefined || interestRate < 0) {
            return res.status(400).json({
                success: false,
                message: 'Nombre del banco y tasa de interés válida requeridos'
            });
        }

        const rate = await prisma.bankRate.upsert({
            where: { bankName },
            update: { 
                interestRate: parseFloat(interestRate), 
                termMonths: termMonths ? parseInt(termMonths) : null,
                updatedAt: new Date() 
            },
            create: { 
                bankName, 
                interestRate: parseFloat(interestRate),
                termMonths: termMonths ? parseInt(termMonths) : null
            }
        });

        res.json({
            success: true,
            data: rate,
            message: 'Tasa bancaria guardada exitosamente'
        });
    } catch (error) {
        console.error('Error upserting bank rate:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar tasa bancaria',
            error: error.message
        });
    }
};

// Eliminar tasa bancaria (desactivar)
const deleteBankRate = async (req, res) => {
    try {
        const { id } = req.params;

        const rate = await prisma.bankRate.update({
            where: { id },
            data: { isActive: false, updatedAt: new Date() }
        });

        res.json({
            success: true,
            message: 'Tasa bancaria eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error deleting bank rate:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar tasa bancaria',
            error: error.message
        });
    }
};

module.exports = {
    getBankRates,
    upsertBankRate,
    deleteBankRate
};
