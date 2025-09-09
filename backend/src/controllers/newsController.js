const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/news - Get all active news with pagination
const getNews = async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [news, total] = await Promise.all([
            prisma.news.findMany({
                where: { isActive: true },
                orderBy: { publishedAt: 'desc' },
                skip: offset,
                take: parseInt(limit)
            }),
            prisma.news.count({ where: { isActive: true } })
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
            where: { id }
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
        const { title, synopsis, source, externalUrl, publishedAt } = req.body;

        const newsItem = await prisma.news.create({
            data: {
                title,
                synopsis,
                source,
                externalUrl,
                publishedAt: publishedAt ? new Date(publishedAt) : new Date()
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
        const { title, synopsis, source, externalUrl, publishedAt, isActive } = req.body;

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
                ...(typeof isActive === 'boolean' && { isActive })
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

module.exports = {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    getAllNewsAdmin
};
