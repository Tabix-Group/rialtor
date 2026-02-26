require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const cloudinary = require('../cloudinary');
const multer = require('multer');

const prisma = new PrismaClient();

// Inicializar OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Multer: memoria, 1 imagen, 10MB
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
}).single('image');

// Prompts por estilo
const STYLE_PROMPTS = {
  moderno: 'Furnish this empty room with modern, clean-lined furniture. Use neutral tones (white, grey, beige), minimal decoration, and contemporary materials like glass and metal. Keep the lighting as-is.',
  escandinavo: 'Furnish this empty room in Scandinavian / Nordic minimalist style. Use light wood furniture, white walls, cozy textiles, simple shapes, and plants. Warm and functional atmosphere.',
  clasico: 'Furnish this empty room with classic, elegant furniture. Use rich wood tones, upholstered pieces, symmetrical arrangement, traditional rugs, and refined lighting.',
  industrial: 'Furnish this empty room in industrial loft style. Use dark metal frames, reclaimed wood, exposed-brick texture accents, Edison lighting, and raw textures.',
};

const MONTHLY_LIMIT = 5;

/**
 * Sube un buffer a Cloudinary y retorna { secure_url, public_id }
 */
function uploadBufferToCloudinary(buffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      public_id: publicId,
      resource_type: 'image',
      format: 'jpg',
      quality: 85,
    };
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    uploadStream.end(buffer);
  });
}

/**
 * POST /api/decorala
 * Crea una nueva solicitud de decoración
 */
const createDecoration = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const style = (req.body.style || 'moderno').toLowerCase();

    if (!STYLE_PROMPTS[style]) {
      return res.status(400).json({ error: 'Estilo no válido', validStyles: Object.keys(STYLE_PROMPTS) });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Se requiere una imagen del ambiente' });
    }

    if (!openai) {
      return res.status(503).json({ error: 'Servicio de IA no disponible. Verificá la configuración de OPENAI_API_KEY.' });
    }

    // Verificar cuota mensual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usageThisMonth = await prisma.decorationRequest.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    });

    if (usageThisMonth >= MONTHLY_LIMIT) {
      return res.status(429).json({
        error: 'Límite mensual alcanzado',
        message: `Usaste las ${MONTHLY_LIMIT} generaciones del mes. El contador se reinicia el 1° del próximo mes.`,
        used: usageThisMonth,
        limit: MONTHLY_LIMIT,
      });
    }

    // Subir imagen original a Cloudinary
    const originalPublicId = `original_${Date.now()}`;
    const originalResult = await uploadBufferToCloudinary(
      req.file.buffer,
      `decorala/originales/${userId}`,
      originalPublicId
    );

    // Crear registro en DB con status PROCESSING
    const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // +15 días
    const decoration = await prisma.decorationRequest.create({
      data: {
        userId,
        originalUrl: originalResult.secure_url,
        originalId: originalResult.public_id,
        style,
        status: 'PROCESSING',
        expiresAt,
      },
    });

    // Responder inmediatamente sin bloquear la generación
    res.status(201).json({
      id: decoration.id,
      status: 'PROCESSING',
      used: usageThisMonth + 1,
      limit: MONTHLY_LIMIT,
    });

    // --- Generación asincrónica ---
    (async () => {
      try {
        console.log(`[DECORALA] Iniciando generación para request ${decoration.id}, estilo: ${style}`);

        // Convertir imagen original a base64 para la API
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        // Llamar a gpt-image-1 (imagen-in, imagen-out)
        const response = await openai.images.edit({
          model: 'gpt-image-1',
          image: await OpenAI.toFile(req.file.buffer, 'room.png', { type: mimeType }),
          prompt: STYLE_PROMPTS[style],
          size: '1024x1024',
        });

        const generatedB64 = response.data[0].b64_json;
        const generatedBuffer = Buffer.from(generatedB64, 'base64');

        // Subir imagen generada a Cloudinary
        const generatedPublicId = `generated_${Date.now()}`;
        const generatedResult = await uploadBufferToCloudinary(
          generatedBuffer,
          `decorala/generadas/${userId}`,
          generatedPublicId
        );

        // Actualizar registro con resultado
        await prisma.decorationRequest.update({
          where: { id: decoration.id },
          data: {
            status: 'COMPLETED',
            generatedUrl: generatedResult.secure_url,
            generatedId: generatedResult.public_id,
          },
        });

        console.log(`[DECORALA] Generación completada: ${decoration.id}`);
      } catch (aiError) {
        console.error(`[DECORALA] Error en generación IA para ${decoration.id}:`, aiError.message);
        await prisma.decorationRequest.update({
          where: { id: decoration.id },
          data: {
            status: 'ERROR',
            errorMessage: aiError.message,
          },
        }).catch(() => {});
      }
    })();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/decorala
 * Lista las decoraciones del usuario (completadas y en proceso)
 */
const getDecorations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const decorations = await prisma.decorationRequest.findMany({
      where: {
        userId,
        expiresAt: { gt: now },
        status: { in: ['COMPLETED', 'PROCESSING'] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalUrl: true,
        generatedUrl: true,
        style: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // Calcular uso del mes actual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usageThisMonth = await prisma.decorationRequest.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    });

    res.json({
      decorations,
      usage: { used: usageThisMonth, limit: MONTHLY_LIMIT },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/decorala/:id
 * Obtiene una decoración por ID (para polling)
 */
const getDecorationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const decoration = await prisma.decorationRequest.findFirst({
      where: { id, userId },
      select: {
        id: true,
        originalUrl: true,
        generatedUrl: true,
        style: true,
        status: true,
        errorMessage: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!decoration) {
      return res.status(404).json({ error: 'Decoración no encontrada' });
    }

    res.json(decoration);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/decorala/:id
 * Elimina una decoración y sus imágenes de Cloudinary
 */
const deleteDecoration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const decoration = await prisma.decorationRequest.findFirst({ where: { id, userId } });

    if (!decoration) {
      return res.status(404).json({ error: 'Decoración no encontrada' });
    }

    // Eliminar de Cloudinary
    try {
      if (decoration.originalId) {
        await cloudinary.uploader.destroy(decoration.originalId);
      }
      if (decoration.generatedId) {
        await cloudinary.uploader.destroy(decoration.generatedId);
      }
    } catch (cloudinaryError) {
      console.error('[DECORALA DELETE] Error eliminando de Cloudinary:', cloudinaryError.message);
      // No bloquear la eliminación del registro
    }

    await prisma.decorationRequest.delete({ where: { id } });

    res.json({ message: 'Decoración eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  createDecoration,
  getDecorations,
  getDecorationById,
  deleteDecoration,
};
