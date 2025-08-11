require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const cloudinary = require('../cloudinary');
const multer = require('multer');
const sharp = require('sharp');
const fetch = require('node-fetch'); // Importar fetch para compatibilidad

const prisma = new PrismaClient();

// Inicializar OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

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

/**
 * Crear una nueva placa de propiedad
 */
const createPropertyPlaque = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      propertyData
    } = req.body;

    // Validar que se hayan subido imágenes
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Se requiere al menos una imagen',
        message: 'Debe subir al menos una imagen de la propiedad'
      });
    }

    // Validar datos de la propiedad
    const propertyInfo = JSON.parse(propertyData);
    if (!propertyInfo.precio || !propertyInfo.direccion || !propertyInfo.contacto) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Faltan datos obligatorios de la propiedad (precio, dirección, contacto)'
      });
    }

    console.log('[PLACAS] Iniciando procesamiento para usuario:', userId);
    console.log('[PLACAS] Número de imágenes:', req.files.length);
    console.log('[PLACAS] Datos de propiedad:', propertyInfo);

    // Crear registro inicial
    const plaque = await prisma.propertyPlaque.create({
      data: {
        userId,
        title: title || 'Nueva Placa de Propiedad',
        description,
        propertyData: JSON.stringify(propertyInfo),
        originalImages: JSON.stringify([]), // Se llenará después
        generatedImages: JSON.stringify([]),
        status: 'PROCESSING'
      }
    });

    // Procesar imágenes de forma asíncrona
    processImagesAndGeneratePlaques(plaque.id, req.files, propertyInfo)
      .catch(error => {
        console.error('[PLACAS] Error en procesamiento asíncrono:', error);
        // Actualizar estado a error
        prisma.propertyPlaque.update({
          where: { id: plaque.id },
          data: { 
            status: 'ERROR',
            metadata: JSON.stringify({ error: error.message })
          }
        }).catch(console.error);
      });

    res.status(201).json({
      message: 'Placa de propiedad creada exitosamente. El procesamiento iniciará en breve.',
      plaque: {
        id: plaque.id,
        title: plaque.title,
        status: plaque.status,
        createdAt: plaque.createdAt
      }
    });

  } catch (error) {
    console.error('[PLACAS] Error creando placa:', error);
    next(error);
  }
};

/**
 * Procesar imágenes y generar placas (función asíncrona)
 */
async function processImagesAndGeneratePlaques(plaqueId, files, propertyInfo) {
  try {
    console.log('[PLACAS] Iniciando procesamiento de imágenes para placa:', plaqueId);
    console.log('[PLACAS] Datos de propiedad:', JSON.stringify(propertyInfo, null, 2));

    // 1. Subir imágenes originales a Cloudinary
    const originalImageUrls = [];
    for (const file of files) {
      console.log('[PLACAS] Subiendo imagen a Cloudinary...');
      const result = await uploadImageToCloudinary(file.buffer, `placas/originales/${plaqueId}`);
      originalImageUrls.push(result.secure_url);
      console.log('[PLACAS] Imagen subida:', result.secure_url);
    }

    console.log('[PLACAS] Imágenes originales subidas:', originalImageUrls.length);

    // 2. Actualizar registro con URLs originales
    await prisma.propertyPlaque.update({
      where: { id: plaqueId },
      data: { 
        originalImages: JSON.stringify(originalImageUrls),
        status: 'GENERATING'
      }
    });

    console.log('[PLACAS] Estado actualizado a GENERATING');

    // 3. Generar placas usando OpenAI Vision + diseño
    const generatedImageUrls = [];
    
    for (let i = 0; i < originalImageUrls.length; i++) {
      const originalUrl = originalImageUrls[i];
      console.log(`[PLACAS] Procesando imagen ${i + 1}/${originalImageUrls.length}: ${originalUrl}`);
      
      try {
        // Generar placa para esta imagen
        const plaqueImageUrl = await generatePlaqueForImage(originalUrl, propertyInfo);
        generatedImageUrls.push(plaqueImageUrl);
        console.log(`[PLACAS] Placa generada para imagen ${i + 1}: ${plaqueImageUrl}`);
      } catch (error) {
        console.error(`[PLACAS] Error generando placa para imagen ${i + 1}:`, error.message);
        console.error(`[PLACAS] Stack trace:`, error.stack);
        // Continuar con las demás imágenes
      }
    }

    console.log('[PLACAS] Total de placas generadas:', generatedImageUrls.length);

    // 4. Actualizar estado final
    await prisma.propertyPlaque.update({
      where: { id: plaqueId },
      data: {
        generatedImages: JSON.stringify(generatedImageUrls),
        status: generatedImageUrls.length > 0 ? 'COMPLETED' : 'ERROR',
        updatedAt: new Date()
      }
    });

    console.log('[PLACAS] Procesamiento completado. Placas generadas:', generatedImageUrls.length);

  } catch (error) {
    console.error('[PLACAS] Error en procesamiento:', error.message);
    console.error('[PLACAS] Stack trace completo:', error.stack);
    await prisma.propertyPlaque.update({
      where: { id: plaqueId },
      data: { 
        status: 'ERROR',
        metadata: JSON.stringify({ error: error.message, stack: error.stack })
      }
    });
  }
}

/**
 * Generar placa para una imagen específica
 */
async function generatePlaqueForImage(imageUrl, propertyInfo) {
  console.log('[PLACAS] Iniciando generación de placa para:', imageUrl);
  
  if (!openai) {
    throw new Error('OpenAI no está configurado');
  }

  try {
    console.log('[PLACAS] Llamando a OpenAI Vision API...');
    
    // 1. Analizar la imagen con OpenAI Vision
    const analysisPrompt = `
Analiza esta imagen de propiedad inmobiliaria y describe:
1. Tipo de propiedad (casa, departamento, local, etc.)
2. Características visuales principales
3. Mejor ubicación para colocar información de venta (esquinas menos ocupadas)
4. Estilo arquitectónico o decorativo
5. Iluminación y colores predominantes

Responde en formato JSON con las claves: tipo, caracteristicas, ubicacion_texto, estilo, colores.
`;

    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: analysisPrompt },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    console.log('[PLACAS] Respuesta de OpenAI Vision recibida');

    let imageAnalysis;
    try {
      const rawContent = visionResponse.choices[0].message.content;
      console.log('[PLACAS] Contenido crudo de OpenAI:', rawContent);
      imageAnalysis = JSON.parse(rawContent);
      console.log('[PLACAS] Análisis parseado exitosamente:', imageAnalysis);
    } catch (parseError) {
      console.warn('[PLACAS] Error parseando JSON de OpenAI, usando valores por defecto:', parseError.message);
      // Si no es JSON válido, usar valores por defecto
      imageAnalysis = {
        tipo: "propiedad",
        caracteristicas: "propiedad inmobiliaria",
        ubicacion_texto: "esquina superior derecha",
        estilo: "moderno",
        colores: "neutros"
      };
    }

    console.log('[PLACAS] Análisis de imagen final:', imageAnalysis);

    // 2. Generar el overlay de información
    console.log('[PLACAS] Generando overlay...');
    const plaqueImageBuffer = await createPlaqueOverlay(imageUrl, propertyInfo, imageAnalysis);
    console.log('[PLACAS] Overlay generado, tamaño del buffer:', plaqueImageBuffer.length);

    // 3. Subir imagen final a Cloudinary
    console.log('[PLACAS] Subiendo placa final a Cloudinary...');
    const result = await uploadBufferToCloudinary(
      plaqueImageBuffer, 
      `placas/generadas/${Date.now()}_placa.png`
    );

    console.log('[PLACAS] Placa final subida a:', result.secure_url);
    return result.secure_url;

  } catch (error) {
    console.error('[PLACAS] Error detallado en generación de placa:', {
      message: error.message,
      stack: error.stack,
      imageUrl: imageUrl
    });
    throw error;
  }
}

/**
 * Crear overlay de información sobre la imagen
 */
async function createPlaqueOverlay(imageUrl, propertyInfo, imageAnalysis) {
  try {
    console.log('[PLACAS] Descargando imagen de:', imageUrl);
    
    // Descargar imagen original
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Error descargando imagen: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    
    console.log('[PLACAS] Imagen descargada, tamaño:', imageBuffer.length, 'bytes');

    // Procesar con Sharp
    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata();
    
    console.log('[PLACAS] Dimensiones de imagen:', width, 'x', height);

    // Crear SVG con la información de la propiedad
    const overlayColor = determineOverlayColor(imageAnalysis.colores);
    const textColor = overlayColor === 'rgba(0,0,0,0.8)' ? '#FFFFFF' : '#000000';
    
    console.log('[PLACAS] Generando overlay con color:', overlayColor);
    
    const svgOverlay = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .precio { font-family: Arial, sans-serif; font-size: ${Math.max(24, width/30)}px; font-weight: bold; fill: ${textColor}; }
            .info { font-family: Arial, sans-serif; font-size: ${Math.max(16, width/50)}px; fill: ${textColor}; }
            .contacto { font-family: Arial, sans-serif; font-size: ${Math.max(14, width/60)}px; fill: ${textColor}; }
          </style>
        </defs>
        
        <!-- Fondo semitransparente -->
        <rect x="${width - 350}" y="20" width="320" height="200" fill="${overlayColor}" rx="10"/>
        
        <!-- Precio principal -->
        <text x="${width - 330}" y="50" class="precio">
          ${propertyInfo.moneda || '$'} ${formatPrice(propertyInfo.precio)}
        </text>
        
        <!-- Tipo y características -->
        <text x="${width - 330}" y="80" class="info">
          ${propertyInfo.tipo || imageAnalysis.tipo}
        </text>
        
        ${propertyInfo.ambientes ? `
        <text x="${width - 330}" y="105" class="info">
          ${propertyInfo.ambientes} ambientes
        </text>
        ` : ''}
        
        ${propertyInfo.superficie ? `
        <text x="${width - 330}" y="130" class="info">
          ${propertyInfo.superficie} m²
        </text>
        ` : ''}
        
        <!-- Dirección -->
        <text x="${width - 330}" y="155" class="info">
          📍 ${propertyInfo.direccion}
        </text>
        
        <!-- Contacto -->
        <text x="${width - 330}" y="180" class="contacto">
          📞 ${propertyInfo.contacto}
        </text>
        
        ${propertyInfo.email ? `
        <text x="${width - 330}" y="200" class="contacto">
          ✉️ ${propertyInfo.email}
        </text>
        ` : ''}
        
        <!-- Logo RE/MAX (esquina inferior) -->
        <rect x="20" y="${height - 80}" width="100" height="60" fill="rgba(220,38,127,0.9)" rx="5"/>
        <text x="25" y="${height - 45}" style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; fill: white;">RE/MAX</text>
      </svg>
    `;

    // Aplicar overlay a la imagen
    const processedImage = await image
      .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
      .png()
      .toBuffer();

    return processedImage;

  } catch (error) {
    console.error('[PLACAS] Error creando overlay:', error);
    throw error;
  }
}

/**
 * Determinar color de fondo para el overlay basado en los colores de la imagen
 */
function determineOverlayColor(colores) {
  const colorLower = colores.toLowerCase();
  if (colorLower.includes('oscuro') || colorLower.includes('negro') || colorLower.includes('dark')) {
    return 'rgba(255,255,255,0.9)'; // Fondo blanco para imágenes oscuras
  }
  return 'rgba(0,0,0,0.8)'; // Fondo oscuro para imágenes claras
}

/**
 * Formatear precio con separadores de miles
 */
function formatPrice(price) {
  return parseInt(price).toLocaleString('es-AR');
}

/**
 * Subir imagen a Cloudinary desde buffer
 */
function uploadImageToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'jpg',
        quality: 80
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Subir buffer a Cloudinary
 */
function uploadBufferToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'image',
        format: 'png'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Obtener placas del usuario
 */
const getUserPlaques = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const where = { userId };
    if (status) where.status = status;

    const plaques = await prisma.propertyPlaque.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.propertyPlaque.count({ where });

    res.json({
      message: 'Placas obtenidas exitosamente',
      plaques: plaques.map(plaque => ({
        ...plaque,
        propertyData: JSON.parse(plaque.propertyData),
        originalImages: JSON.parse(plaque.originalImages),
        generatedImages: JSON.parse(plaque.generatedImages),
        metadata: plaque.metadata ? JSON.parse(plaque.metadata) : null
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener una placa específica
 */
const getPlaqueById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plaque = await prisma.propertyPlaque.findFirst({
      where: { id, userId }
    });

    if (!plaque) {
      return res.status(404).json({
        error: 'Placa no encontrada',
        message: 'La placa no existe o no tienes acceso a ella'
      });
    }

    res.json({
      message: 'Placa obtenida exitosamente',
      plaque: {
        ...plaque,
        propertyData: JSON.parse(plaque.propertyData),
        originalImages: JSON.parse(plaque.originalImages),
        generatedImages: JSON.parse(plaque.generatedImages),
        metadata: plaque.metadata ? JSON.parse(plaque.metadata) : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar una placa
 */
const deletePlaque = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const plaque = await prisma.propertyPlaque.findFirst({
      where: { id, userId }
    });

    if (!plaque) {
      return res.status(404).json({
        error: 'Placa no encontrada',
        message: 'La placa no existe o no tienes acceso a ella'
      });
    }

    // Eliminar imágenes de Cloudinary (opcional)
    try {
      const originalImages = JSON.parse(plaque.originalImages);
      const generatedImages = JSON.parse(plaque.generatedImages);
      
      for (const imageUrl of [...originalImages, ...generatedImages]) {
        const publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    } catch (error) {
      console.error('[PLACAS] Error eliminando imágenes de Cloudinary:', error);
      // No fallar la eliminación por esto
    }

    await prisma.propertyPlaque.delete({ where: { id } });

    res.json({
      message: 'Placa eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Extraer public_id de URL de Cloudinary
 */
function extractPublicIdFromUrl(url) {
  try {
    const matches = url.match(/\/([^\/]+)\.(jpg|jpeg|png|gif)$/);
    return matches ? matches[1] : null;
  } catch {
    return null;
  }
}

module.exports = {
  upload: upload.array('images', 10), // Máximo 10 imágenes
  createPropertyPlaque,
  getUserPlaques,
  getPlaqueById,
  deletePlaque
};
