const { PrismaClient } = require('@prisma/client');
const { syncWorldPropertyJournal, cleanOldNews, getImportStats } = require('../services/rssService');

const prisma = new PrismaClient();

// GET /api/news - Get all active news with pagination and category filtering
const getNews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = { isActive: true };
        if (category) {
            where.categoryId = category;
        }

        const [news, total] = await Promise.all([
            prisma.news.findMany({
                where,
                include: {
                    category: true
                },
                orderBy: { publishedAt: 'desc' },
                skip: offset,
                take: parseInt(limit)
            }),
            prisma.news.count({ where })
        ]);

        res.json({
            news,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/news/:id - Get news by ID
const getNewsById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const newsItem = await prisma.news.findUnique({
            where: { id },
            include: {
                category: true
            }
        });

        if (!newsItem) {
            return res.status(404).json({ error: 'News not found' });
        }

        res.json({ news: newsItem });
    } catch (error) {
        next(error);
    }
};

// POST /api/news - Create new news (admin only)
const createNews = async (req, res, next) => {
    try {
        const { title, synopsis, source, externalUrl, publishedAt, categoryId } = req.body;

        const newsItem = await prisma.news.create({
            data: {
                title,
                synopsis,
                source,
                externalUrl,
                publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
                categoryId: categoryId || null
            },
            include: {
                category: true
            }
        });

        res.status(201).json({ news: newsItem });
    } catch (error) {
        next(error);
    }
};

// PUT /api/news/:id - Update news (admin only)
const updateNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, synopsis, source, externalUrl, publishedAt, isActive, categoryId } = req.body;

        const existingNews = await prisma.news.findUnique({
            where: { id }
        });

        if (!existingNews) {
            return res.status(404).json({ error: 'News not found' });
        }

        const newsItem = await prisma.news.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(synopsis && { synopsis }),
                ...(source && { source }),
                ...(externalUrl && { externalUrl }),
                ...(publishedAt && { publishedAt: new Date(publishedAt) }),
                ...(typeof isActive === 'boolean' && { isActive }),
                ...(categoryId !== undefined && { categoryId: categoryId || null })
            },
            include: {
                category: true
            }
        });

        res.json({ news: newsItem });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/news/:id - Delete news (admin only)
const deleteNews = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existingNews = await prisma.news.findUnique({
            where: { id }
        });

        if (!existingNews) {
            return res.status(404).json({ error: 'News not found' });
        }

        await prisma.news.delete({
            where: { id }
        });

        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/news - Get all news for admin (including inactive)
const getAllNewsAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [news, total] = await Promise.all([
            prisma.news.findMany({
                include: {
                    category: true
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: parseInt(limit)
            }),
            prisma.news.count()
        ]);

        res.json({
            news,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/categories - Get all active categories
const getCategories = async (req, res, next) => {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });

        res.json({ categories });
    } catch (error) {
        next(error);
    }
};

// POST /api/news/sync - Sync news from RSS feed (admin only)
const syncRSSFeed = async (req, res, next) => {
    try {
        const { limit = 20 } = req.body;

        const result = await syncWorldPropertyJournal(limit);

        if (result.success) {
            res.json({
                message: result.message,
                stats: result.stats
            });
        } else {
            res.status(500).json({
                error: result.message,
                stats: result.stats
            });
        }
    } catch (error) {
        next(error);
    }
};

// DELETE /api/news/clean-old - Clean old news (admin only)
const cleanOldNewsItems = async (req, res, next) => {
    try {
        const { daysOld = 90 } = req.body;

        const result = await cleanOldNews(daysOld);

        if (result.success) {
            res.json({
                message: result.message,
                deletedCount: result.deletedCount
            });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        next(error);
    }
};

// GET /api/news/stats - Get import statistics (admin only)
const getNewsStats = async (req, res, next) => {
    try {
        const result = await getImportStats();

        if (result.success) {
            res.json({ stats: result.stats });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    getAllNewsAdmin,
    getCategories,
    syncRSSFeed,
    cleanOldNewsItems,
    getNewsStats
};
