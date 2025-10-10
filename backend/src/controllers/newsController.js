const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/news - Get all active news with pagination and category filtering
const getNews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = { isActive: true };
        if (category) {
            where.categories = {
                some: {
                    categoryId: category
                }
            };
        }

        const [news, total] = await Promise.all([
            prisma.news.findMany({
                where,
                include: {
                    categories: {
                        include: {
                            category: true
                        }
                    }
                },
                orderBy: { publishedAt: 'desc' },
                skip: offset,
                take: parseInt(limit)
            }),
            prisma.news.count({ where })
        ]);

        // Transform data to include categories array
        const transformedNews = news.map(item => ({
            ...item,
            categories: item.categories.map(nc => nc.category)
        }));

        res.json({
            news: transformedNews,
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
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        });

        if (!newsItem) {
            return res.status(404).json({ error: 'News not found' });
        }

        // Transform data to include categories array
        const transformedNews = {
            ...newsItem,
            categories: newsItem.categories.map(nc => nc.category)
        };

        res.json({ news: transformedNews });
    } catch (error) {
        next(error);
    }
};

// POST /api/news - Create new news (admin only)
const createNews = async (req, res, next) => {
    try {
        const { title, synopsis, source, externalUrl, publishedAt, categoryIds } = req.body;

        const newsItem = await prisma.news.create({
            data: {
                title,
                synopsis,
                source,
                externalUrl,
                publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
                categories: categoryIds && categoryIds.length > 0 ? {
                    create: categoryIds.map(categoryId => ({
                        categoryId
                    }))
                } : undefined
            },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        });

        // Transform data to include categories array
        const transformedNews = {
            ...newsItem,
            categories: newsItem.categories.map(nc => nc.category)
        };

        res.status(201).json({ news: transformedNews });
    } catch (error) {
        next(error);
    }
};

// PUT /api/news/:id - Update news (admin only)
const updateNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, synopsis, source, externalUrl, publishedAt, isActive, categoryIds } = req.body;

        const existingNews = await prisma.news.findUnique({
            where: { id }
        });

        if (!existingNews) {
            return res.status(404).json({ error: 'News not found' });
        }

        // Update news and categories in a transaction
        const newsItem = await prisma.$transaction(async (prisma) => {
            // Update the news item
            const updatedNews = await prisma.news.update({
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

            // Update categories if provided
            if (categoryIds !== undefined) {
                // Delete existing category relationships
                await prisma.newsCategory.deleteMany({
                    where: { newsId: id }
                });

                // Create new category relationships
                if (categoryIds && categoryIds.length > 0) {
                    await prisma.newsCategory.createMany({
                        data: categoryIds.map(categoryId => ({
                            newsId: id,
                            categoryId
                        }))
                    });
                }
            }

            // Fetch the updated news with categories
            return await prisma.news.findUnique({
                where: { id },
                include: {
                    categories: {
                        include: {
                            category: true
                        }
                    }
                }
            });
        });

        // Transform data to include categories array
        const transformedNews = {
            ...newsItem,
            categories: newsItem.categories.map(nc => nc.category)
        };

        res.json({ news: transformedNews });
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
                    categories: {
                        include: {
                            category: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: parseInt(limit)
            }),
            prisma.news.count()
        ]);

        // Transform data to include categories array
        const transformedNews = news.map(item => ({
            ...item,
            categories: item.categories.map(nc => nc.category)
        }));

        res.json({
            news: transformedNews,
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

module.exports = {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    getAllNewsAdmin,
    getCategories
};
