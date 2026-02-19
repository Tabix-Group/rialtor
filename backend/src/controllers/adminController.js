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

    // Contar archivos subidos en Cloudinary (carpeta 'documents')
    const cloudinary = require('../cloudinary');
    let documentsUploaded = 0;
    try {
      const result = await cloudinary.search
        .expression('folder:documents')
        .max_results(100)
        .execute();
      documentsUploaded = result.resources.length;
    } catch (e) {
      documentsUploaded = 0;
    }
    console.log('Documentos subidos (Cloudinary):', documentsUploaded);

    // Preparar meses para gráficos
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const activityData = [];
    
    // Obtener datos para los últimos 6 meses (uno por uno para evitar problemas de agrupación por fecha exacta)
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setMonth(startOfMonth.getMonth() - i);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const [uCount, cCount, aCount] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: startOfMonth, lt: endOfMonth } } }),
        prisma.chatSession.count({ where: { createdAt: { gte: startOfMonth, lt: endOfMonth } } }),
        prisma.article.count({ where: { createdAt: { gte: startOfMonth, lt: endOfMonth } } })
      ]);

      activityData.push({
        name: months[startOfMonth.getMonth()],
        actividad: uCount + cCount + aCount,
        usuarios: uCount,
        consultas: cCount,
        articulos: aCount
      });
    }

    // Usuarios Activos vs Inactivos
    const activeUsersCount = await prisma.user.count({ where: { isActive: true } });
    const inactiveUsersCount = await prisma.user.count({ where: { isActive: false } });
    const userStatusData = [
      { name: 'Activos', value: activeUsersCount || 0 },
      { name: 'Inactivos', value: inactiveUsersCount || 0 }
    ];

    res.json({
      totalUsers,
      publishedArticles,
      chatQueries,
      documentsUploaded,
      activityData,
      userStatusData
    });
  } catch (error) {
    console.error('Error en getStats:', error);
    next(error);
  }
};

module.exports = { getStats };
