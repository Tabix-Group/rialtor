const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/categories - Get all categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        news: {
          where: { isActive: true },
          select: { id: true }
        },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Add article count to each category
    const categoriesWithCount = categories.map(category => ({
      ...category,
      articleCount: category.news.length,
      news: undefined // Remove news from response
    }));

    res.json({ categories: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id - Get category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        children: {
          where: { isActive: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories - Create new category (admin only)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, color, icon, parentId } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    // If parentId is provided, verify it exists
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parentCategory) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug,
        color: color || '#3B82F6',
        icon,
        parentId: parentId || null
      },
      include: {
        parent: true,
        children: true
      }
    });

    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id - Update category (admin only)
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, parentId, isActive } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // If name is being updated, generate new slug
    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if new slug already exists
      const slugExists = await prisma.category.findUnique({
        where: { slug }
      });

      if (slugExists && slugExists.id !== id) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
    }

    // If parentId is provided, verify it exists and is not the same as current category
    if (parentId) {
      if (parentId === id) {
        return res.status(400).json({ error: 'Category cannot be parent of itself' });
      }

      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parentCategory) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name, slug }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(icon !== undefined && { icon }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      include: {
        parent: true,
        children: true,
        news: {
          select: { id: true }
        }
      }
    });

    res.json({ 
      category: {
        ...category,
        articleCount: category.news.length,
        news: undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id - Delete category (admin only)
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        articles: true,
        children: true
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has articles
    if (category.articles.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with articles',
        message: 'Please move or delete all articles in this category first'
      });
    }

    // Check if category has children
    if (category.children.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with subcategories',
        message: 'Please move or delete all subcategories first'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
