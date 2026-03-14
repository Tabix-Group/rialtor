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

// Enviar Excel por email
const sendExcelEmail = async (req, res) => {
  try {
    const { recipientEmail, excelBase64, fileName } = req.body;

    if (!recipientEmail || !excelBase64 || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (recipientEmail, excelBase64, fileName)'
      });
    }

    // Validar que sea un email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Solo usuarios autenticados pueden enviar
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Convertir base64 a buffer
    const excelBuffer = Buffer.from(excelBase64.split(',')[1] || excelBase64, 'base64');

    // Enviar email con Excel adjunto usando nodemailer
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'info@rialtor.app',
        pass: process.env.SMTP_PASS,
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'info@rialtor.app',
      to: recipientEmail,
      subject: 'Tu Análisis Financiero - Rialtor',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0f172a;">Tu Análisis Financiero</h2>
          <p>Adjuntamos el archivo Excel con tu análisis de finanzas y transacciones realizadas en Rialtor.</p>
          <p>El archivo contiene:</p>
          <ul style="color: #555;">
            <li>Listado detallado de movimientos</li>
            <li>Análisis y estadísticas de tus transacciones</li>
            <li>Resumen mensual e ingresos/egresos</li>
            <li>Distribución por categoría y concepto</li>
          </ul>
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <strong>www.rialtor.app</strong><br>
            Herramientas Profesionales para Agentes Inmobiliarios
          </p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: excelBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`[FINANCE] Excel sent to ${recipientEmail}. Message ID: ${info.messageId}`);

    res.json({
      success: true,
      message: 'Excel enviado correctamente',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('[FINANCE] Error sending Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el Excel',
      error: error.message
    });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getBalance,
  sendExcelEmail
};