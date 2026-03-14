const express = require('express');
const router = express.Router();

const financeController = require('../controllers/financeController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener transacciones con filtros opcionales
router.get('/', financeController.getTransactions);

// Crear nueva transacción
router.post('/', financeController.createTransaction);

// Actualizar transacción
router.put('/:id', financeController.updateTransaction);

// Eliminar transacción
router.delete('/:id', financeController.deleteTransaction);

// Obtener saldos consolidados
router.get('/balance', financeController.getBalance);

// Enviar Excel por email
router.post('/send-excel', financeController.sendExcelEmail);

module.exports = router;