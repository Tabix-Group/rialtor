const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/admin/stats - Admin dashboard statistics

const getStats = async (req, res, next) => {
  try {
    console.log('Obteniendo estadísticas del dashboard...');
    const totalUsers = await prisma.user.count();
    console.log('Total usuarios:', totalUsers);
    const publishedArticles = await prisma.article.count({ where: { status: 'PUBLISHED' } });
    console.log('Artículos publicados:', publishedArticles);
    const chatQueries = await prisma.chatSession.count();
    console.log('Consultas chat:', chatQueries);
    const documentsUploaded = await prisma.documentRequest.count();
    console.log('Documentos subidos:', documentsUploaded);

    res.json({ totalUsers, publishedArticles, chatQueries, documentsUploaded });
  } catch (error) {
    console.error('Error en getStats:', error);
    next(error);
  }
};

module.exports = { getStats };
