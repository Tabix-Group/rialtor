require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('../cloudinary');
const multer = require('multer');

const prisma = new PrismaClient();

// Configurar multer para manejo de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Configurar multer para múltiples campos
const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'agentPhoto', maxCount: 1 }
]);

/**
 * Crear una nueva newsletter
 */
const createNewsletter = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      content,
      properties,
      news,
      agentInfo,
      template = 'default'
    } = req.body;

    // Subir imágenes a Cloudinary si existen
    let imageUrls = [];
    if (req.files && req.files['images']) {
      for (const file of req.files['images']) {
        try {
          // Convertir buffer a base64 data URI
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = `data:${file.mimetype};base64,${b64}`;
          
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'newsletters',
            resource_type: 'image'
          });
          imageUrls.push(result.secure_url);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
        }
      }
    }

    // Subir foto del agente si existe
    let agentPhotoUrl = null;
    if (req.files && req.files['agentPhoto'] && req.files['agentPhoto'].length > 0) {
      try {
        // Convertir buffer a base64 data URI
        const file = req.files['agentPhoto'][0];
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'newsletters/agents',
          resource_type: 'image',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });
        agentPhotoUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading agent photo:', uploadError);
      }
    }

    // Parsear agentInfo y agregar foto
    let parsedAgentInfo = null;
    if (agentInfo) {
      parsedAgentInfo = typeof agentInfo === 'string' ? JSON.parse(agentInfo) : agentInfo;
      if (agentPhotoUrl) {
        parsedAgentInfo.photo = agentPhotoUrl;
      }
    }

    // Crear newsletter
    const newsletter = await prisma.newsletter.create({
      data: {
        title,
        content,
        images: JSON.stringify(imageUrls),
        properties: properties || null,
        news: news || null,
        agentInfo: parsedAgentInfo ? JSON.stringify(parsedAgentInfo) : null,
        template,
        userId
      }
    });

    // Parsear campos JSON para la respuesta
    const parsedNewsletter = {
      ...newsletter,
      images: JSON.parse(newsletter.images || '[]'),
      properties: newsletter.properties ? JSON.parse(newsletter.properties) : null,
      news: newsletter.news ? JSON.parse(newsletter.news) : null,
      agentInfo: newsletter.agentInfo ? JSON.parse(newsletter.agentInfo) : null
    };

    res.status(201).json({
      message: 'Newsletter creada exitosamente',
      newsletter: parsedNewsletter
    });
  } catch (error) {
    console.error('Error creando newsletter:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Obtener todas las newsletters del usuario
 */
const getNewsletters = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [newsletters, total] = await Promise.all([
      prisma.newsletter.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.newsletter.count({ where: { userId } })
    ]);

    // Parsear imágenes y otros campos JSON
    const parsedNewsletters = newsletters.map(newsletter => ({
      ...newsletter,
      images: JSON.parse(newsletter.images || '[]'),
      properties: newsletter.properties ? JSON.parse(newsletter.properties) : null,
      news: newsletter.news ? JSON.parse(newsletter.news) : null,
      agentInfo: newsletter.agentInfo ? JSON.parse(newsletter.agentInfo) : null
    }));

    res.json({
      newsletters: parsedNewsletters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo newsletters:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Obtener una newsletter por ID
 */
const getNewsletterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const newsletter = await prisma.newsletter.findFirst({
      where: { id, userId }
    });

    if (!newsletter) {
      return res.status(404).json({
        error: 'Newsletter no encontrada'
      });
    }

    // Parsear campos JSON
    const parsedNewsletter = {
      ...newsletter,
      images: JSON.parse(newsletter.images || '[]'),
      properties: newsletter.properties ? JSON.parse(newsletter.properties) : null,
      news: newsletter.news ? JSON.parse(newsletter.news) : null,
      agentInfo: newsletter.agentInfo ? JSON.parse(newsletter.agentInfo) : null
    };

    res.json({ newsletter: parsedNewsletter });
  } catch (error) {
    console.error('Error obteniendo newsletter:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Actualizar una newsletter
 */
const updateNewsletter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      title,
      content,
      properties,
      news,
      agentInfo,
      template,
      status
    } = req.body;

    // Verificar que la newsletter existe y pertenece al usuario
    const existingNewsletter = await prisma.newsletter.findFirst({
      where: { id, userId }
    });

    if (!existingNewsletter) {
      return res.status(404).json({
        error: 'Newsletter no encontrada'
      });
    }

    // Subir nuevas imágenes si existen
    let imageUrls = JSON.parse(existingNewsletter.images || '[]');
    if (req.files && req.files['images']) {
      for (const file of req.files['images']) {
        try {
          // Convertir buffer a base64 data URI
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = `data:${file.mimetype};base64,${b64}`;
          
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'newsletters',
            resource_type: 'image'
          });
          imageUrls.push(result.secure_url);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
        }
      }
    }

    // Subir foto del agente si existe
    let agentPhotoUrl = null;
    if (req.files && req.files['agentPhoto'] && req.files['agentPhoto'].length > 0) {
      try {
        // Convertir buffer a base64 data URI
        const file = req.files['agentPhoto'][0];
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'newsletters/agents',
          resource_type: 'image',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });
        agentPhotoUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading agent photo:', uploadError);
      }
    }

    // Parsear y actualizar agentInfo
    let updatedAgentInfo = agentInfo !== undefined ? agentInfo : existingNewsletter.agentInfo;
    if (updatedAgentInfo && agentPhotoUrl) {
      const parsedInfo = typeof updatedAgentInfo === 'string' ? JSON.parse(updatedAgentInfo) : updatedAgentInfo;
      parsedInfo.photo = agentPhotoUrl;
      updatedAgentInfo = JSON.stringify(parsedInfo);
    }

    // Actualizar newsletter
    const updatedNewsletter = await prisma.newsletter.update({
      where: { id },
      data: {
        title: title || existingNewsletter.title,
        content: content || existingNewsletter.content,
        images: JSON.stringify(imageUrls),
        properties: properties !== undefined ? properties : existingNewsletter.properties,
        news: news !== undefined ? news : existingNewsletter.news,
        agentInfo: updatedAgentInfo,
        template: template || existingNewsletter.template,
        status: status || existingNewsletter.status
      }
    });

    // Parsear campos JSON para respuesta
    const parsedNewsletter = {
      ...updatedNewsletter,
      images: JSON.parse(updatedNewsletter.images || '[]'),
      properties: updatedNewsletter.properties ? JSON.parse(updatedNewsletter.properties) : null,
      news: updatedNewsletter.news ? JSON.parse(updatedNewsletter.news) : null,
      agentInfo: updatedNewsletter.agentInfo ? JSON.parse(updatedNewsletter.agentInfo) : null
    };

    res.json({
      message: 'Newsletter actualizada exitosamente',
      newsletter: parsedNewsletter
    });
  } catch (error) {
    console.error('Error actualizando newsletter:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Eliminar una newsletter
 */
const deleteNewsletter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la newsletter existe y pertenece al usuario
    const newsletter = await prisma.newsletter.findFirst({
      where: { id, userId }
    });

    if (!newsletter) {
      return res.status(404).json({
        error: 'Newsletter no encontrada'
      });
    }

    // Eliminar imágenes de Cloudinary
    const images = JSON.parse(newsletter.images || '[]');
    for (const imageUrl of images) {
      try {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`newsletters/${publicId}`);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
      }
    }

    // Eliminar newsletter
    await prisma.newsletter.delete({
      where: { id }
    });

    res.json({
      message: 'Newsletter eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando newsletter:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

module.exports = {
  createNewsletter,
  getNewsletters,
  getNewsletterById,
  updateNewsletter,
  deleteNewsletter,
  uploadFields
};