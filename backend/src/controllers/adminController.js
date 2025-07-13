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
    // Contar archivos subidos en la carpeta uploads (no .json)
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(__dirname, '../../uploads');
    let documentsUploaded = 0;
    try {
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        documentsUploaded = files.filter(f => !f.endsWith('.json')).length;
      }
    } catch (e) {
      documentsUploaded = 0;
    }
    console.log('Documentos subidos:', documentsUploaded);

    res.json({ totalUsers, publishedArticles, chatQueries, documentsUploaded });
  } catch (error) {
    console.error('Error en getStats:', error);
    next(error);
  }
};

module.exports = { getStats };
