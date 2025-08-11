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
    console.log('[PLACAS] Datos de propiedad:', JSON.stringify(propertyInfo, null, 2));
    
    // Limpiar y preparar textos para evitar problemas de codificación
    const precio = String(propertyInfo.precio || '0').replace(/[^\d]/g, '');
    const moneda = String(propertyInfo.moneda || 'USD');
    const tipo = String(propertyInfo.tipo || imageAnalysis?.tipo || 'Propiedad');
    const ambientes = propertyInfo.ambientes ? String(propertyInfo.ambientes) : null;
    const superficie = propertyInfo.superficie ? String(propertyInfo.superficie) : null;
    const direccion = String(propertyInfo.direccion || 'Ubicacion disponible');
    const contacto = String(propertyInfo.contacto || 'Contacto disponible');
    const email = propertyInfo.email ? String(propertyInfo.email) : null;
    
    const svgOverlay = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" encoding="UTF-8">
        <defs>
          <style><![CDATA[
            .precio { 
              font-family: 'Arial', 'Helvetica', sans-serif; 
              font-size: ${Math.max(28, width/25)}px; 
              font-weight: bold; 
              fill: ${textColor}; 
            }
            .info { 
              font-family: 'Arial', 'Helvetica', sans-serif; 
              font-size: ${Math.max(18, width/40)}px; 
              fill: ${textColor}; 
              font-weight: 500;
            }
            .contacto { 
              font-family: 'Arial', 'Helvetica', sans-serif; 
              font-size: ${Math.max(16, width/50)}px; 
              fill: ${textColor}; 
            }
            .label {
              font-family: 'Arial', 'Helvetica', sans-serif; 
              font-size: ${Math.max(14, width/60)}px; 
              fill: ${textColor}; 
              opacity: 0.8;
            }
          ]]></style>
        </defs>
        
        <!-- Fondo principal -->
        <rect x="${width - 380}" y="20" width="350" height="220" fill="${overlayColor}" rx="12" stroke="${textColor}" stroke-width="2" opacity="0.95"/>
        
        <!-- Precio principal -->
        <text x="${width - 360}" y="55" class="precio">${moneda} ${formatPrice(precio)}</text>
        
        <!-- Tipo de propiedad -->
        <text x="${width - 360}" y="85" class="info">${tipo}</text>
        
        ${ambientes ? `<text x="${width - 360}" y="110" class="info">${ambientes} ambientes</text>` : ''}
        
        ${superficie ? `<text x="${width - 360}" y="135" class="info">${superficie} m2</text>` : ''}
        
        <!-- Ubicación -->
        <text x="${width - 360}" y="165" class="label">Ubicacion:</text>
        <text x="${width - 360}" y="185" class="contacto">${direccion}</text>
        
        <!-- Contacto -->
        <text x="${width - 360}" y="210" class="label">Contacto:</text>
        <text x="${width - 360}" y="230" class="contacto">${contacto}</text>
        
        ${email ? `<text x="${width - 360}" y="250" class="contacto">${email}</text>` : ''}
        
        <!-- Logo RE/MAX -->
        <rect x="20" y="${height - 90}" width="120" height="70" fill="#DC267F" rx="8"/>
        <text x="30" y="${height - 55}" style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; fill: white;">RE/MAX</text>
        <text x="30" y="${height - 35}" style="font-family: Arial, sans-serif; font-size: 12px; fill: white;">PROPIEDADES</text>
      </svg>`;

    console.log('[PLACAS] SVG generado:', svgOverlay.substring(0, 200) + '...');

    // Aplicar overlay a la imagen con configuración explícita de codificación
    const svgBuffer = Buffer.from(svgOverlay, 'utf8');
    
    console.log('[PLACAS] Tamaño del SVG buffer:', svgBuffer.length, 'bytes');
    
    const processedImage = await image
      .composite([{ 
        input: svgBuffer, 
        top: 0, 
        left: 0 
      }])
      .png({ 
        quality: 90,
        compressionLevel: 6 
      })
      .toBuffer();

    console.log('[PLACAS] Imagen procesada, tamaño final:', processedImage.length, 'bytes');
    
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
  try {
    // Convertir a número, removiendo caracteres no numéricos
    const numPrice = parseInt(String(price).replace(/[^\d]/g, ''));
    if (isNaN(numPrice) || numPrice <= 0) {
      return 'Consultar';
    }
    return numPrice.toLocaleString('es-AR');
  } catch (error) {
    console.error('[PLACAS] Error formateando precio:', error);
    return 'Consultar';
  }
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
