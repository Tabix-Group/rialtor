const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/admin/stats - Admin dashboard statistics
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const publishedArticles = await prisma.article.count({ where: { status: 'PUBLISHED' } });
    const chatQueries = await prisma.chatSession.count();
    const documentsUploaded = await prisma.documentRequest.count();

    res.json({ totalUsers, publishedArticles, chatQueries, documentsUploaded });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
