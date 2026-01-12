const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Obtener prospectos del usuario autenticado
const getProspects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, status, search, limit = 100, offset = 0 } = req.query;

    let where = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (status) where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { note: { contains: search, mode: 'insensitive' } }
      ];
    }

    const prospects = await prisma.prospect.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({ prospects });
  } catch (error) {
    next(error);
  }
};

const getProspectById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const prospect = await prisma.prospect.findFirst({ where: { id, userId } });

    if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

    res.json({ prospect });
  } catch (error) {
    next(error);
  }
};

const createProspect = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, note, estimatedValue, estimatedCommission, clientsProspected, probability, status, closedValue, closeDate } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const prospect = await prisma.prospect.create({
      data: {
        title: title.trim(),
        note,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        estimatedCommission: estimatedCommission ? parseFloat(estimatedCommission) : null,
        clientsProspected: clientsProspected ? parseInt(clientsProspected, 10) : 0,
        probability: probability ? parseInt(probability, 10) : null,
        status: status || undefined,
        closedValue: closedValue ? parseFloat(closedValue) : null,
        closeDate: closeDate ? new Date(closeDate) : null,
        userId,
      }
    });

    res.status(201).json({ prospect });
  } catch (error) {
    next(error);
  }
};

const updateProspect = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, note, estimatedValue, estimatedCommission, clientsProspected, probability, status, closedValue, closeDate } = req.body;

    const existing = await prisma.prospect.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Prospect not found' });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (note !== undefined) updateData.note = note;
    if (estimatedValue !== undefined) updateData.estimatedValue = estimatedValue !== null ? parseFloat(estimatedValue) : null;
    if (estimatedCommission !== undefined) updateData.estimatedCommission = estimatedCommission !== null ? parseFloat(estimatedCommission) : null;
    if (clientsProspected !== undefined) updateData.clientsProspected = clientsProspected !== null ? parseInt(clientsProspected, 10) : 0;
    if (probability !== undefined) updateData.probability = probability !== null ? parseInt(probability, 10) : null;
    if (status !== undefined) updateData.status = status;
    if (closedValue !== undefined) updateData.closedValue = closedValue !== null ? parseFloat(closedValue) : null;
    if (closeDate !== undefined) updateData.closeDate = closeDate ? new Date(closeDate) : null;

    const prospect = await prisma.prospect.update({ where: { id }, data: updateData });

    res.json({ prospect });
  } catch (error) {
    next(error);
  }
};

const deleteProspect = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await prisma.prospect.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Prospect not found' });

    await prisma.prospect.delete({ where: { id } });

    res.json({ message: 'Prospect deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Stats: avg sale, avg commission, clients prospected, conversion rate
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let where = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const total = await prisma.prospect.count({ where });
    const wonWhere = { ...where, status: 'CIERRES' };
    const wonCount = await prisma.prospect.count({ where: wonWhere });

    const avgSaleRaw = await prisma.prospect.aggregate({
      _avg: { closedValue: true },
      where: wonWhere
    });

    const avgCommissionRaw = await prisma.prospect.aggregate({
      _avg: { estimatedCommission: true },
      where
    });

    const clientsSumRaw = await prisma.prospect.aggregate({
      _sum: { clientsProspected: true },
      where
    });

    const avgSale = avgSaleRaw._avg.closedValue || 0;
    const avgCommission = avgCommissionRaw._avg.estimatedCommission || 0;
    const clientsProspected = clientsSumRaw._sum.clientsProspected || 0;
    const conversionRate = total > 0 ? (wonCount / total) * 100 : 0;

    res.json({
      stats: {
        total,
        wonCount,
        avgSale,
        avgCommission,
        clientsProspected,
        conversionRate
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProspects,
  getProspectById,
  createProspect,
  updateProspect,
  deleteProspect,
  getStats
};
