const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/articles - Get all articles with pagination and filtering
const getArticles = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      status = 'PUBLISHED',
      featured 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      ...(status && { status }),
      ...(category && { categoryId: category }),
      ...(typeof featured === 'boolean' && { featured }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Get articles with pagination
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          category: {
            select: { id: true, name: true, slug: true, color: true }
          },
          comments: {
            where: { isApproved: true },
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.article.count({ where })
    ]);

    // Parse tags and add computed fields
    const articlesWithExtras = articles.map(article => ({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
      commentCount: article.comments.length,
      readingTime: Math.ceil(article.content.split(' ').length / 200) + ' min',
      comments: undefined // Remove comments from response
    }));

    res.json({
      articles: articlesWithExtras,
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

// GET /api/articles/:id - Get article by ID
const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true }
        },
        comments: {
          where: { isApproved: true },
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        attachments: true
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment views
    await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    // Parse tags and add computed fields
    const articleWithExtras = {
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
      commentCount: article.comments.length,
      readingTime: Math.ceil(article.content.split(' ').length / 200) + ' min',
      views: article.views + 1
    };

    res.json({ article: articleWithExtras });
  } catch (error) {
    next(error);
  }
};

// GET /api/articles/slug/:slug - Get article by slug
const getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true }
        },
        comments: {
          where: { isApproved: true },
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        attachments: true
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment views
    await prisma.article.update({
      where: { slug },
      data: { views: { increment: 1 } }
    });

    // Parse tags and add computed fields
    const articleWithExtras = {
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
      commentCount: article.comments.length,
      readingTime: Math.ceil(article.content.split(' ').length / 200) + ' min',
      views: article.views + 1
    };

    res.json({ article: articleWithExtras });
  } catch (error) {
    next(error);
  }
};

// POST /api/articles - Create new article
const createArticle = async (req, res, next) => {
  try {
    const { title, content, excerpt, categoryId, tags = [], featured = false, status = 'DRAFT' } = req.body;
    const authorId = req.user.id;

    // Generate slug from title
    const slug = title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    });

    if (existingArticle) {
      return res.status(400).json({ error: 'Article with this title already exists' });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({ error: 'Category not found' });
    }

    // Create article
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        categoryId,
        authorId,
        tags: JSON.stringify(tags),
        featured,
        status
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true }
        }
      }
    });

    res.status(201).json({
      article: {
        ...article,
        tags: JSON.parse(article.tags),
        commentCount: 0,
        readingTime: Math.ceil(article.content.split(' ').length / 200) + ' min'
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/articles/:id - Update article
const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, categoryId, tags, featured, status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check permissions - only author or admin can update
    if (existingArticle.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this article' });
    }

    // If title is being updated, generate new slug
    let slug = existingArticle.slug;
    if (title && title !== existingArticle.title) {
      slug = title.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if new slug already exists
      const slugExists = await prisma.article.findUnique({
        where: { slug }
      });

      if (slugExists && slugExists.id !== id) {
        return res.status(400).json({ error: 'Article with this title already exists' });
      }
    }

    // If categoryId is provided, verify it exists
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    // Update article
    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title && { title, slug }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(categoryId && { categoryId }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(typeof featured === 'boolean' && { featured }),
        ...(status && { status })
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true }
        },
        comments: {
          where: { isApproved: true },
          select: { id: true }
        }
      }
    });

    res.json({
      article: {
        ...article,
        tags: JSON.parse(article.tags),
        commentCount: article.comments.length,
        readingTime: Math.ceil(article.content.split(' ').length / 200) + ' min',
        comments: undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/articles/:id - Delete article
const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check permissions - only author or admin can delete
    if (article.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this article' });
    }

    // Delete article (this will cascade delete comments and attachments)
    await prisma.article.delete({
      where: { id }
    });

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle
};
