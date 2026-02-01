const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener transacciones del usuario autenticado
const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, currency } = req.query;

    let where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate + 'T00:00:00.000Z');
      if (endDate) where.date.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    if (currency) {
      where.currency = currency;
    }

    const transactions = await prisma.financeTransaction.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
};

// Crear una nueva transacción
const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tipo, type, concept, description, amount, currency, date } = req.body;

    if (!['Personal', 'Laboral'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo must be Personal or Laboral' });
    }

    if (!['ingreso', 'egreso'].includes(type)) {
      return res.status(400).json({ error: 'Type must be ingreso or egreso' });
    }

    if (!['ARS', 'USD'].includes(currency)) {
      return res.status(400).json({ error: 'Currency must be ARS or USD' });
    }

    const transaction = await prisma.financeTransaction.create({
      data: {
        userId,
        tipo,
        type,
        concept,
        description,
        amount: parseFloat(amount),
        currency,
        date: date ? new Date(date) : new Date()
      }
    });

    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

// Actualizar una transacción
const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { tipo, type, concept, description, amount, currency, date } = req.body;

    // Verificar que la transacción pertenece al usuario
    const existing = await prisma.financeTransaction.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (tipo && !['Personal', 'Laboral'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo must be Personal or Laboral' });
    }

    if (type && !['ingreso', 'egreso'].includes(type)) {
      return res.status(400).json({ error: 'Type must be ingreso or egreso' });
    }

    if (currency && !['ARS', 'USD'].includes(currency)) {
      return res.status(400).json({ error: 'Currency must be ARS or USD' });
    }

    const updateData = {};
    if (tipo) updateData.tipo = tipo;
    if (type) updateData.type = type;
    if (concept) updateData.concept = concept;
    if (description !== undefined) updateData.description = description;
    if (amount) updateData.amount = parseFloat(amount);
    if (currency) updateData.currency = currency;
    if (date) updateData.date = new Date(date);

    const transaction = await prisma.financeTransaction.update({
      where: { id },
      data: updateData
    });

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

// Eliminar una transacción
const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar que la transacción pertenece al usuario
    const existing = await prisma.financeTransaction.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.financeTransaction.delete({
      where: { id }
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Obtener saldos consolidados por moneda
const getBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate + 'T00:00:00.000Z');
      if (endDate) where.date.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const transactions = await prisma.financeTransaction.findMany({
      where,
      select: { type: true, amount: true, currency: true }
    });

    const balances = { ARS: 0, USD: 0 };

    transactions.forEach(t => {
      if (t.type === 'ingreso') {
        balances[t.currency] += t.amount;
      } else {
        balances[t.currency] -= t.amount;
      }
    });

    res.json({ balances });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBalance
};