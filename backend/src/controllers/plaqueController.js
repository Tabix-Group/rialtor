                                                                                                  require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const cloudinary = require('../cloudinary');
const multer = require('multer');
const sharp = require('sharp');
const QRCode = require('qrcode');
// Node 18+ tiene fetch nativo, no necesitamos importar node-fetch

const prisma = new PrismaClient();

// Inicializar OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
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

// Configurar multer para múltiples campos de archivos
const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 }, // Imágenes de la propiedad (standard/premium)
  { name: 'agentImage', maxCount: 1 }, // Imagen del agente (premium/vip)
  { name: 'interiorImage', maxCount: 1 }, // Imagen interior (vip)
  { name: 'exteriorImage', maxCount: 1 } // Imagen exterior (vip)
]);

/**
 * Crear una nueva placa de propiedad
 */
const createPropertyPlaque = async (req, res, next) => {
  try {
    console.log('[PLACAS] ===== INICIANDO CREACIÓN DE PLACA =====');
    console.log('[PLACAS] Headers:', JSON.stringify(req.headers, null, 2));
    console.log('[PLACAS] Body keys:', Object.keys(req.body));
    console.log('[PLACAS] Files:', req.files ? Object.keys(req.files) : 'No files');

    const userId = req.user.id;
    const {
      title,
      description,
      propertyData,
      modelType = 'standard' // Tipos: standard, premium, vip
    } = req.body;

    console.log('[PLACAS] Usuario ID:', userId);
    console.log('[PLACAS] Title:', title);
    console.log('[PLACAS] Description:', description);
    console.log('[PLACAS] PropertyData raw:', propertyData);
    console.log('[PLACAS] Model Type:', modelType);

    // Validaciones específicas según el tipo de modelo
    if (modelType === 'vip') {
      // Para VIP: requerir imagen interior y exterior
      if (!req.files || !req.files.interiorImage || !req.files.exteriorImage) {
        console.error('[PLACAS VIP] Faltan imágenes requeridas');
        return res.status(400).json({
          error: 'Imágenes incompletas',
          message: 'El modelo VIP requiere imagen interior y exterior'
        });
      }
    } else {
      // Para standard/premium: requerir imágenes de propiedad
      if (!req.files || !req.files.images || req.files.images.length === 0) {
        console.error('[PLACAS] No se recibieron imágenes de propiedad');
        return res.status(400).json({
          error: 'Se requiere al menos una imagen',
          message: 'Debe subir al menos una imagen de la propiedad'
        });
      }

      // Limitar número máximo de imágenes de propiedad a 10
      if (req.files.images.length > 10) {
        console.error('[PLACAS] Demasiadas imágenes de propiedad:', req.files.images.length);
        return res.status(400).json({
          error: 'Límite de imágenes excedido',
          message: 'Solo se permiten hasta 10 imágenes por placa'
        });
      }
    }

    // Validar datos de la propiedad
    let propertyInfo;
    try {
      propertyInfo = JSON.parse(propertyData);
      console.log('[PLACAS] PropertyInfo parsed:', JSON.stringify(propertyInfo, null, 2));
    } catch (parseError) {
      console.error('[PLACAS] Error parsing propertyData:', parseError);
      return res.status(400).json({
        error: 'Datos de propiedad inválidos',
        message: 'Los datos de la propiedad no tienen un formato válido'
      });
    }

    // Manejar imagen del agente si fue subida
    if (req.files && req.files.agentImage && req.files.agentImage.length > 0) {
      try {
        console.log('[PLACAS] Subiendo imagen del agente a Cloudinary...');
        const agentImageResult = await uploadImageToCloudinary(req.files.agentImage[0].buffer, 'placas/agentes');
        propertyInfo.agentImage = agentImageResult.secure_url;
        console.log('[PLACAS] Imagen del agente subida:', agentImageResult.secure_url);
      } catch (error) {
        console.error('[PLACAS] Error subiendo imagen del agente:', error);
        return res.status(400).json({
          error: 'Error procesando imagen del agente',
          message: 'No se pudo subir la imagen del agente'
        });
      }
    }

    if (!propertyInfo.precio || !propertyInfo.corredores) {
      console.error('[PLACAS] Faltan datos obligatorios:', {
        precio: !!propertyInfo.precio,
        corredores: !!propertyInfo.corredores
      });
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Faltan datos obligatorios de la propiedad (precio, corredores)'
      });
    }

    // Validación opcional para imagen del agente en modelo premium
    if (modelType === 'premium' && !propertyInfo.agentImage?.trim()) {
      console.log('[PLACAS] Advertencia: Modelo premium sin imagen del agente');
      // No fallar, solo loggear
    }

    console.log('[PLACAS] Validación exitosa, creando registro en BD...');

    // Crear registro inicial
    const plaque = await prisma.propertyPlaque.create({
      data: {
        userId,
        title: title || 'Nueva Placa de Propiedad',
        description,
        propertyData: JSON.stringify(propertyInfo),
        originalImages: JSON.stringify([]), // Se llenará después
        generatedImages: JSON.stringify([]),
        status: 'PROCESSING',
        modelType // Nuevo campo
      }
    });

    console.log('[PLACAS] Registro creado con ID:', plaque.id);
    console.log('[PLACAS] Iniciando procesamiento asíncrono...');

    // Procesar imágenes de forma asíncrona
    processImagesAndGeneratePlaques(plaque.id, req.files, propertyInfo, modelType)
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

    console.log('[PLACAS] Respondiendo al cliente...');
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
 * Delega al controlador específico según el tipo de modelo
 */
async function processImagesAndGeneratePlaques(plaqueId, files, propertyInfo, modelType = 'standard') {
  try {
    console.log('[PLACAS] Iniciando procesamiento de imágenes para placa:', plaqueId);
    console.log('[PLACAS] Modelo:', modelType);

    let result;

    // Delegar al controlador específico según el tipo de modelo
    // Cada controlador se encarga de actualizar la BD
    if (modelType === 'vip') {
      result = await processVIPPlaque(plaqueId, files, propertyInfo);
    } else {
      // standard o premium
      result = await processStandardAndPremiumPlaques(plaqueId, files, propertyInfo, modelType);
    }

    console.log('[PLACAS] Procesamiento completado exitosamente');
    return result;

  } catch (error) {
    console.error('[PLACAS] Error en procesamiento:', error);
    
    // Actualizar estado a ERROR
    await prisma.propertyPlaque.update({
      where: { id: plaqueId },
      data: {
        status: 'ERROR',
        metadata: JSON.stringify({ error: error.message })
      }
    }).catch(console.error);
    
    throw error;
  }
}

/**
 * Procesar placas standard y premium
 */
async function processStandardAndPremiumPlaques(plaqueId, files, propertyInfo, modelType) {
  try {
    console.log(`[PLACAS ${modelType.toUpperCase()}] Iniciando procesamiento:`, plaqueId);
    
    // 1. Subir imágenes originales a Cloudinary
    const originalImageUrls = [];
    const imageFiles = files.images || [];
    
    for (const file of imageFiles) {
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

    // 3. Generar placas usando el overlay
    const generatedImageUrls = [];

    for (let i = 0; i < originalImageUrls.length; i++) {
      const originalUrl = originalImageUrls[i];
      console.log(`[PLACAS] Procesando imagen ${i + 1}/${originalImageUrls.length}: ${originalUrl}`);

      try {
        const imageAnalysis = {
          ubicacion_texto: null,
          colores: null,
          tipo: null
        };

        console.log('[PLACAS] Generando overlay...');
        const plaqueImageBuffer = await createPlaqueOverlay(originalUrl, propertyInfo, imageAnalysis, null, modelType);
        console.log('[PLACAS] Overlay generado, tamaño del buffer:', plaqueImageBuffer.length);

        console.log('[PLACAS] Subiendo placa final a Cloudinary...');
        const folder = 'placas/generadas';
        const filename = `${Date.now()}_placa`;
        const result = await uploadBufferToCloudinary(plaqueImageBuffer, folder, filename);
        generatedImageUrls.push(result.secure_url);
        console.log('[PLACAS] Placa final subida a:', result.secure_url);

      } catch (err) {
        console.error(`[PLACAS] Error generando placa para imagen ${i + 1}:`, err && err.message ? err.message : err);
      }
    }

    console.log('[PLACAS] Total de placas generadas:', generatedImageUrls.length);

    // 4. Actualizar el registro con las imágenes generadas y marcar como COMPLETED
    await prisma.propertyPlaque.update({
      where: { id: plaqueId },
      data: {
        generatedImages: JSON.stringify(generatedImageUrls),
        status: 'COMPLETED'
      }
    });

    console.log(`[PLACAS ${modelType.toUpperCase()}] Procesamiento completado. Placas generadas:`, generatedImageUrls.length);
    
    return {
      originalImageUrls,
      generatedImages: generatedImageUrls
    };

  } catch (error) {
    console.error(`[PLACAS ${modelType.toUpperCase()}] Error en procesamiento:`, error);
    throw error;
  }
}

/**
 * Procesar placa VIP con template personalizado
 */
async function processVIPPlaque(plaqueId, files, propertyInfo) {
  try {
    console.log('[PLACAS VIP] Iniciando procesamiento de placa VIP:', plaqueId);
    
    // Obtener los buffers de las imágenes
    const interiorImage = files.interiorImage?.[0];
    const exteriorImage = files.exteriorImage?.[0];
    const agentImage = files.agentImage?.[0];
    
    if (!interiorImage || !exteriorImage) {
      throw new Error('Faltan imágenes requeridas para modelo VIP');
    }
    
    // 1. Subir imágenes originales a Cloudinary
    console.log('[PLACAS VIP] Subiendo imágenes originales...');
    const originalImageUrls = [];
    
    const interiorResult = await uploadImageToCloudinary(interiorImage.buffer, `placas/originales/${plaqueId}`);
    originalImageUrls.push(interiorResult.secure_url);
    
    const exteriorResult = await uploadImageToCloudinary(exteriorImage.buffer, `placas/originales/${plaqueId}`);
    originalImageUrls.push(exteriorResult.secure_url);
    
    if (agentImage) {
      const agentResult = await uploadImageToCloudinary(agentImage.buffer, `placas/originales/${plaqueId}`);
      originalImageUrls.push(agentResult.secure_url);
    }
    
    console.log('[PLACAS VIP] Imágenes originales subidas:', originalImageUrls.length);
    
    // 2. Actualizar registro con URLs originales
    await prisma.propertyPlaque.update({
      where: { id: plaqueId },
      data: {
        originalImages: JSON.stringify(originalImageUrls),
        status: 'GENERATING'
      }
    });
    
    console.log('[PLACAS VIP] Estado actualizado a GENERATING');
    
    // 3. Generar placa VIP usando el template
    const path = require('path');
    const fs = require('fs');
    
    // Intentar múltiples rutas posibles
    const possiblePaths = [
      path.resolve(__dirname, '../../../frontend/public/images/templateplaca.jpeg'),
      path.resolve(process.cwd(), '../frontend/public/images/templateplaca.jpeg'),
      path.resolve('/app', 'frontend/public/images/templateplaca.jpeg'),
      path.resolve(process.cwd(), 'frontend/public/images/templateplaca.jpeg')
    ];
    
    let templatePath = null;
    for (const possiblePath of possiblePaths) {
      console.log('[PLACAS VIP] Probando ruta:', possiblePath);
      if (fs.existsSync(possiblePath)) {
        templatePath = possiblePath;
        console.log('[PLACAS VIP] Template encontrado en:', templatePath);
        break;
      }
    }
    
    if (!templatePath) {
      // Si no se encuentra el template local, intentar descargarlo de una URL
      console.log('[PLACAS VIP] Template local no encontrado, descargando desde URL...');
      const templateUrl = 'https://www.rialtor.app/images/templateplaca.jpeg';
      
      try {
        const response = await fetch(templateUrl);
        if (!response.ok) {
          throw new Error(`No se pudo descargar el template desde ${templateUrl}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const templateBuffer = Buffer.from(arrayBuffer);
        
        // Usar el buffer directamente
        const vipPlaqueBuffer = await createVIPPlaqueOverlayFromBuffer(
          templateBuffer,
          propertyInfo,
          interiorImage.buffer,
          exteriorImage.buffer,
          agentImage ? agentImage.buffer : null
        );
        
        console.log('[PLACAS VIP] Placa VIP generada desde template descargado');
        
        // Subir placa final a Cloudinary
        console.log('[PLACAS VIP] Subiendo placa final a Cloudinary...');
        const folder = 'placas/generadas';
        const filename = `${Date.now()}_vip_placa`;
        const result = await uploadBufferToCloudinary(vipPlaqueBuffer, folder, filename);
        
        console.log('[PLACAS VIP] Placa final subida a:', result.secure_url);
        
        // Actualizar registro con placa generada
        console.log('[PLACAS VIP] Actualizando registro en BD con plaqueId:', plaqueId);
        const updatedPlaque = await prisma.propertyPlaque.update({
          where: { id: plaqueId },
          data: {
            generatedImages: JSON.stringify([result.secure_url]),
            status: 'COMPLETED'
          }
        });
        
        console.log('[PLACAS VIP] Registro actualizado exitosamente. Status:', updatedPlaque.status);
        console.log('[PLACAS VIP] Procesamiento completado exitosamente');
        return [result.secure_url];
        
      } catch (downloadError) {
        throw new Error(`Template no encontrado. Rutas probadas: ${possiblePaths.join(', ')}. Error descarga: ${downloadError.message}`);
      }
    }
    
    const vipPlaqueBuffer = await createVIPPlaqueOverlay(
      templatePath,
      propertyInfo,
      interiorImage.buffer,
      exteriorImage.buffer,
      agentImage ? agentImage.buffer : null
    );
    
    console.log('[PLACAS VIP] Placa VIP generada, tamaño:', vipPlaqueBuffer.length);
    
    // 4. Subir placa final a Cloudinary
    console.log('[PLACAS VIP] Subiendo placa final a Cloudinary...');
    const folder = 'placas/generadas';
    const filename = `${Date.now()}_vip_placa`;
    const result = await uploadBufferToCloudinary(vipPlaqueBuffer, folder, filename);
    
    console.log('[PLACAS VIP] Placa final subida a:', result.secure_url);
    
    // 5. Actualizar registro con placa generada
    console.log('[PLACAS VIP] Actualizando registro en BD con plaqueId:', plaqueId);
    const updatedPlaque = await prisma.propertyPlaque.update({
      where: { id: plaqueId },
      data: {
        generatedImages: JSON.stringify([result.secure_url]),
        status: 'COMPLETED'
      }
    });
    
    console.log('[PLACAS VIP] Registro actualizado exitosamente. Status:', updatedPlaque.status);
    console.log('[PLACAS VIP] Procesamiento completado exitosamente');
    return [result.secure_url];
    
  } catch (error) {
    console.error('[PLACAS VIP] Error en procesamiento:', error);
    throw error;
  }
}

/**
 * Crear overlay de información sobre la imagen con soporte para múltiples formatos
 */
async function createPlaqueOverlay(imageUrl, propertyInfo, imageAnalysis, outputFormat = null, modelType = 'standard') {
  try {
    console.log('[PLACAS] Descargando imagen de:', imageUrl);
    
    // Formatos predefinidos para redes sociales
    const formats = {
      instagram_square: { width: 1080, height: 1080, name: 'Instagram Cuadrado' },
      instagram_portrait: { width: 1080, height: 1350, name: 'Instagram Vertical' },
      instagram_story: { width: 1080, height: 1920, name: 'Instagram Story' },
      facebook_post: { width: 1200, height: 630, name: 'Facebook Post' },
      facebook_story: { width: 1080, height: 1920, name: 'Facebook Story' },
      twitter_post: { width: 1200, height: 675, name: 'Twitter Post' },
      linkedin_post: { width: 1200, height: 627, name: 'LinkedIn Post' },
      web_landscape: { width: 1920, height: 1080, name: 'Web Horizontal' },
      web_portrait: { width: 1080, height: 1920, name: 'Web Vertical' },
      original: { width: null, height: null, name: 'Original' }
    };

    // Descargar imagen original con reintentos para evitar fallos intermitentes (ECONNRESET)
    async function fetchWithRetry(url, attempts = 3, backoff = 500, timeoutMs = 10000) {
      for (let i = 0; i < attempts; i++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const resp = await fetch(url, { signal: controller.signal });
          clearTimeout(id);
          if (!resp.ok) throw new Error(`Error descargando imagen: ${resp.status} ${resp.statusText}`);
          return resp;
        } catch (err) {
          clearTimeout(id);
          const msg = err && err.message ? err.message : String(err);
          console.warn(`[PLACAS] fetch attempt ${i + 1} failed for ${url}:`, msg);
          // Si fue aborto por timeout o error de conexión, reintentar
          if (i === attempts - 1) {
            // Lanzar error enriquecido
            const finalErr = new Error(`fetch failed after ${attempts} attempts: ${msg}`);
            finalErr.cause = err;
            throw finalErr;
          }
          // Esperar backoff exponencial
          await new Promise(r => setTimeout(r, backoff * (i + 1)));
        }
      }
    }

    const response = await fetchWithRetry(imageUrl, 3, 600, 12000);
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    console.log('[PLACAS] Imagen descargada, tamaño:', imageBuffer.length, 'bytes');

    // Procesar con Sharp
    let image = sharp(imageBuffer);
    const metadata = await image.metadata();
    let { width, height } = metadata;

    console.log('[PLACAS] Dimensiones originales:', width, 'x', height);

    // Si se especifica un formato de salida, redimensionar la imagen
    if (outputFormat && outputFormat !== 'original' && formats[outputFormat]) {
      const targetFormat = formats[outputFormat];
      console.log('[PLACAS] Redimensionando a formato:', targetFormat.name, `(${targetFormat.width}x${targetFormat.height})`);
      
      image = sharp(imageBuffer).resize(targetFormat.width, targetFormat.height, {
        fit: 'cover',
        position: 'center'
      });
      
      width = targetFormat.width;
      height = targetFormat.height;
    }

    console.log('[PLACAS] Dimensiones finales:', width, 'x', height);

    // Crear SVG con la información de la propiedad
    const overlayColor = determineOverlayColor(imageAnalysis.colores);
    const textColor = overlayColor === 'rgba(0,0,0,0.8)' ? '#FFFFFF' : '#000000';

    console.log('[PLACAS] Generando overlay con color:', overlayColor);
    console.log('[PLACAS] Datos de propiedad:', JSON.stringify(propertyInfo, null, 2));

    // Limpiar y preparar textos para evitar problemas de codificación y overlays vacíos
    function cleanText(val, fallback, maxLen = 40) {
      if (!val) return fallback;
      let s = String(val).replace(/[<>"'`]/g, '').trim();
      if (s.length === 0) return fallback;
      return s.length > maxLen ? s.slice(0, maxLen) + '…' : s;
    }

    const precio = cleanText(propertyInfo.precio, 'Consultar', 20).replace(/[^\d]/g, '');
    const moneda = cleanText(propertyInfo.moneda, 'USD', 8);
    const tipo = cleanText(propertyInfo.tipo || imageAnalysis?.tipo, 'Propiedad', 30);
    const ambientes = propertyInfo.ambientes ? cleanText(propertyInfo.ambientes, '', 10) : null;
    const m2_totales = propertyInfo.m2_totales ? cleanText(propertyInfo.m2_totales, '', 10) : null;
    const m2_cubiertos = propertyInfo.m2_cubiertos ? cleanText(propertyInfo.m2_cubiertos, '', 10) : null;
    const banos = propertyInfo.banos ? cleanText(propertyInfo.banos, '', 10) : null;
    const direccion = cleanText(propertyInfo.direccion || 'Ubicación disponible', 40);
    const contacto = cleanText(propertyInfo.contacto || 'Contacto disponible', 30);
    const email = propertyInfo.email ? cleanText(propertyInfo.email, '', 40) : null;
    const corredores = cleanText(propertyInfo.corredores, '', 80); // Ahora obligatorio
    const antiguedad = propertyInfo.antiguedad ? cleanText(propertyInfo.antiguedad, '', 20) : null;

    // Log para depuración
    console.log('[PLACAS][DEBUG] Overlay fields:', { precio, moneda, tipo, ambientes, m2_totales, m2_cubiertos, banos, direccion, contacto, email, antiguedad });

    // Escapar texto para insertar en SVG y evitar caracteres inválidos
    function escapeForSvg(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }



    // Generar el SVG llamando a la función factorizada (module-level)
    const svgOverlay = createPlaqueSvgString(width, height, propertyInfo, imageAnalysis, modelType);
    console.log('[PLACAS] SVG generado (long):', svgOverlay.substring(0, 200) + '...');

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

    // Si es premium y hay imagen del agente, componerla sobre la imagen
    if (modelType === 'premium' && propertyInfo.agentImage) {
      try {
        console.log('[PLACAS] Descargando y procesando imagen del agente...');
        
        // Descargar imagen del agente
        const agentResponse = await fetchWithRetry(propertyInfo.agentImage, 3, 600, 12000);
        const agentArrayBuffer = await agentResponse.arrayBuffer();
        const agentBuffer = Buffer.from(agentArrayBuffer);
        
        // Calcular posición y tamaño del agente en el footer
        const agentBoxHeight = Math.floor(height * 0.24);
        const agentBoxY = height - agentBoxHeight;
        const agentImageSize = 110;
        const agentX = 60;
        const agentY = agentBoxY + (agentBoxHeight - agentImageSize) / 2;
        
        // Procesar imagen del agente: redimensionar a círculo
        const agentProcessed = await sharp(agentBuffer)
          .resize(agentImageSize, agentImageSize, {
            fit: 'cover',
            position: 'center'
          })
          .composite([{
            // Crear máscara circular
            input: Buffer.from(
              `<svg width="${agentImageSize}" height="${agentImageSize}">
                <circle cx="${agentImageSize/2}" cy="${agentImageSize/2}" r="${agentImageSize/2}" fill="white"/>
              </svg>`
            ),
            blend: 'dest-in'
          }])
          .png()
          .toBuffer();
        
        console.log('[PLACAS] Imagen del agente procesada, componiendo...');
        
        // Componer la imagen del agente sobre la placa
        const finalImage = await sharp(processedImage)
          .composite([{
            input: agentProcessed,
            top: Math.round(agentY),
            left: Math.round(agentX)
          }])
          .png({ quality: 90, compressionLevel: 6 })
          .toBuffer();
        
        console.log('[PLACAS] Imagen final con agente compuesta');
        return finalImage;
        
      } catch (agentError) {
        console.error('[PLACAS] Error procesando imagen del agente:', agentError);
        // Continuar sin la imagen del agente
        return processedImage;
      }
    }

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
  try {
    if (!colores || typeof colores !== 'string') return 'rgba(0,0,0,0.8)';
    const colorLower = colores.toLowerCase();
    if (colorLower.includes('oscuro') || colorLower.includes('negro') || colorLower.includes('dark')) {
      return 'rgba(255,255,255,0.9)'; // Fondo blanco para imágenes oscuras
    }
    return 'rgba(0,0,0,0.8)'; // Fondo oscuro para imágenes claras
  } catch (e) {
    console.warn('[PLACAS] determineOverlayColor error, usando valor por defecto:', e && e.message);
    return 'rgba(0,0,0,0.8)';
  }
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

// Helper para escapar texto en SVG (module-level)
function escapeForSvg(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

    // Función factorizada para generar el string SVG del overlay.
function createPlaqueSvgString(width, height, propertyInfo, imageAnalysis, modelType = 'standard') {
  try {
    const precio = String(propertyInfo.precio || 'Consultar').replace(/[^\d]/g, '');
    const moneda = propertyInfo.moneda || 'USD';
    const tipo = propertyInfo.tipo || (imageAnalysis && imageAnalysis.tipo) || 'Propiedad';
    const ambientes = propertyInfo.ambientes || null;
    const dormitorios = propertyInfo.dormitorios || null;
    const banos = propertyInfo.banos || null;
    const cocheras = propertyInfo.cocheras || null;
    const m2_totales = propertyInfo.m2_totales || null;
    const m2_cubiertos = propertyInfo.m2_cubiertos || null;
    const direccion = propertyInfo.direccion || null; // Ahora opcional
    const contacto = propertyInfo.contacto || null; // Ya no obligatorio
    const email = propertyInfo.email || null;
    const corredores = propertyInfo.corredores || null; // Ahora obligatorio
    const antiguedad = propertyInfo.antiguedad || null;
    const geometricPattern = propertyInfo.geometricPattern || 'none'; // Nuevo campo para patrones geométricos
    const brand = propertyInfo.brand || null; // Nuevo campo para marca    // Calcular cantidad de campos con información para diseño adaptativo
    let fieldCount = 0;
    if (tipo) fieldCount++;
    if (antiguedad) fieldCount++;
    if (ambientes) fieldCount++;
    if (dormitorios) fieldCount++;
    if (banos) fieldCount++;
    if (cocheras) fieldCount++;
    if (m2_totales) fieldCount++;
    if (m2_cubiertos) fieldCount++;
    if (direccion) fieldCount++;
    if (contacto) fieldCount++;
    if (email) fieldCount++;
    
    // Sistema de espaciado adaptativo: más campos = menos espacio entre líneas
    const baseLineSpacing = 16;
    const adaptiveSpacing = Math.max(8, Math.min(baseLineSpacing, Math.floor(baseLineSpacing * (1 - (fieldCount / 30)))));
    
    // Factor de escala basado en dimensiones de imagen
    const scaleFactor = Math.min(1, Math.sqrt((width * height) / (1920 * 1080)));
    const minScaleFactor = 0.6;
    const maxScaleFactor = 1.2;
    const finalScaleFactor = Math.max(minScaleFactor, Math.min(maxScaleFactor, scaleFactor));

    // Descripción adicional para renderizar abajo-derecha (si existe)
    const descripcion = propertyInfo.descripcion || propertyInfo.descripcion_adicional || null;
    const overlayColor = determineOverlayColor(imageAnalysis && imageAnalysis.colores);
    const textColor = overlayColor === 'rgba(0,0,0,0.8)' ? '#FFFFFF' : '#000000';
    
    // Función para crear patrones geométricos
    function createGeometricPattern(patternType) {
      const borderThickness = Math.max(15, Math.floor(width * 0.02)); // Grosor del borde (2% mínimo 15px)
      
      switch (patternType) {
        case 'diagonal_lines':
          return `
            <defs>
              <pattern id="diagonalLinesPattern" patternUnits="userSpaceOnUse" width="20" height="20">
                <line x1="0" y1="0" x2="20" y2="20" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
                <line x1="0" y1="20" x2="20" y2="0" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
              </pattern>
            </defs>
            <!-- Borde superior -->
            <rect x="0" y="0" width="${width}" height="${borderThickness}" fill="url(#diagonalLinesPattern)" />
            <!-- Borde inferior -->
            <rect x="0" y="${height - borderThickness}" width="${width}" height="${borderThickness}" fill="url(#diagonalLinesPattern)" />
            <!-- Borde izquierdo -->
            <rect x="0" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#diagonalLinesPattern)" />
            <!-- Borde derecho -->
            <rect x="${width - borderThickness}" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#diagonalLinesPattern)" />
          `;
        
        case 'concentric_circles':
          return `
            <defs>
              <pattern id="concentricCirclesPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
                <circle cx="20" cy="20" r="12" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
                <circle cx="20" cy="20" r="6" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
              </pattern>
            </defs>
            <!-- Borde superior -->
            <rect x="0" y="0" width="${width}" height="${borderThickness}" fill="url(#concentricCirclesPattern)" />
            <!-- Borde inferior -->
            <rect x="0" y="${height - borderThickness}" width="${width}" height="${borderThickness}" fill="url(#concentricCirclesPattern)" />
            <!-- Borde izquierdo -->
            <rect x="0" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#concentricCirclesPattern)" />
            <!-- Borde derecho -->
            <rect x="${width - borderThickness}" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#concentricCirclesPattern)" />
          `;
        
        case 'triangles':
          return `
            <defs>
              <pattern id="trianglesPattern" patternUnits="userSpaceOnUse" width="30" height="26">
                <polygon points="15,2 28,24 2,24" fill="rgba(255,255,255,0.12)" />
                <polygon points="15,24 28,2 2,2" fill="rgba(255,255,255,0.08)" />
              </pattern>
            </defs>
            <!-- Borde superior -->
            <rect x="0" y="0" width="${width}" height="${borderThickness}" fill="url(#trianglesPattern)" />
            <!-- Borde inferior -->
            <rect x="0" y="${height - borderThickness}" width="${width}" height="${borderThickness}" fill="url(#trianglesPattern)" />
            <!-- Borde izquierdo -->
            <rect x="0" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#trianglesPattern)" />
            <!-- Borde derecho -->
            <rect x="${width - borderThickness}" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#trianglesPattern)" />
          `;
        
        case 'hexagons':
          return `
            <defs>
              <pattern id="hexagonsPattern" patternUnits="userSpaceOnUse" width="50" height="43">
                <polygon points="25,2 45,13 45,32 25,43 5,32 5,13" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
              </pattern>
            </defs>
            <!-- Borde superior -->
            <rect x="0" y="0" width="${width}" height="${borderThickness}" fill="url(#hexagonsPattern)" />
            <!-- Borde inferior -->
            <rect x="0" y="${height - borderThickness}" width="${width}" height="${borderThickness}" fill="url(#hexagonsPattern)" />
            <!-- Borde izquierdo -->
            <rect x="0" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#hexagonsPattern)" />
            <!-- Borde derecho -->
            <rect x="${width - borderThickness}" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#hexagonsPattern)" />
          `;
        
        case 'waves':
          return `
            <defs>
              <pattern id="wavesPattern" patternUnits="userSpaceOnUse" width="40" height="20">
                <path d="M0,10 Q10,0 20,10 T40,10" stroke="rgba(255,255,255,0.15)" stroke-width="2" fill="none" />
                <path d="M0,15 Q10,5 20,15 T40,15" stroke="rgba(255,255,255,0.1)" stroke-width="1" fill="none" />
              </pattern>
            </defs>
            <!-- Borde superior -->
            <rect x="0" y="0" width="${width}" height="${borderThickness}" fill="url(#wavesPattern)" />
            <!-- Borde inferior -->
            <rect x="0" y="${height - borderThickness}" width="${width}" height="${borderThickness}" fill="url(#wavesPattern)" />
            <!-- Borde izquierdo -->
            <rect x="0" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#wavesPattern)" />
            <!-- Borde derecho -->
            <rect x="${width - borderThickness}" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#wavesPattern)" />
          `;
        
        case 'dots':
          return `
            <defs>
              <pattern id="dotsPattern" patternUnits="userSpaceOnUse" width="15" height="15">
                <circle cx="7.5" cy="7.5" r="1.5" fill="rgba(255,255,255,0.4)" />
              </pattern>
            </defs>
            <!-- Borde superior -->
            <rect x="0" y="0" width="${width}" height="${borderThickness}" fill="url(#dotsPattern)" />
            <!-- Borde inferior -->
            <rect x="0" y="${height - borderThickness}" width="${width}" height="${borderThickness}" fill="url(#dotsPattern)" />
            <!-- Borde izquierdo -->
            <rect x="0" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#dotsPattern)" />
            <!-- Borde derecho -->
            <rect x="${width - borderThickness}" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#dotsPattern)" />
          `;
        
        case 'elegant':
          return `
            <defs>
              <linearGradient id="elegantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(118, 104, 93, 0.8)" />
                <stop offset="50%" stop-color="rgba(139, 115, 85, 0.6)" />
                <stop offset="100%" stop-color="rgba(118, 104, 93, 0.8)" />
              </linearGradient>
              <pattern id="elegantPattern" patternUnits="userSpaceOnUse" width="20" height="20">
                <rect width="20" height="20" fill="url(#elegantGradient)" />
                <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.3)" />
              </pattern>
            </defs>
            <!-- Borde superior -->
            <rect x="0" y="0" width="${width}" height="${borderThickness}" fill="url(#elegantPattern)" />
            <!-- Borde inferior -->
            <rect x="0" y="${height - borderThickness}" width="${width}" height="${borderThickness}" fill="url(#elegantPattern)" />
            <!-- Borde izquierdo -->
            <rect x="0" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#elegantPattern)" />
            <!-- Borde derecho -->
            <rect x="${width - borderThickness}" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#elegantPattern)" />
          `;
        
        case 'lines':
          return `
            <defs>
              <pattern id="linesPattern" patternUnits="userSpaceOnUse" width="20" height="20">
                <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
                <line x1="10" y1="0" x2="10" y2="20" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
              </pattern>
            </defs>
            <!-- Borde superior -->
            <rect x="0" y="0" width="${width}" height="${borderThickness}" fill="url(#linesPattern)" />
            <!-- Borde inferior -->
            <rect x="0" y="${height - borderThickness}" width="${width}" height="${borderThickness}" fill="url(#linesPattern)" />
            <!-- Borde izquierdo -->
            <rect x="0" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#linesPattern)" />
            <!-- Borde derecho -->
            <rect x="${width - borderThickness}" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#linesPattern)" />
          `;
        
        case 'geometric':
          return `
            <defs>
              <pattern id="geometricPattern" patternUnits="userSpaceOnUse" width="30" height="30">
                <polygon points="15,0 30,15 15,30 0,15" fill="rgba(255,255,255,0.2)" />
                <circle cx="15" cy="15" r="3" fill="rgba(255,255,255,0.4)" />
              </pattern>
            </defs>
            <!-- Borde superior -->
            <rect x="0" y="0" width="${width}" height="${borderThickness}" fill="url(#geometricPattern)" />
            <!-- Borde inferior -->
            <rect x="0" y="${height - borderThickness}" width="${width}" height="${borderThickness}" fill="url(#geometricPattern)" />
            <!-- Borde izquierdo -->
            <rect x="0" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#geometricPattern)" />
            <!-- Borde derecho -->
            <rect x="${width - borderThickness}" y="${borderThickness}" width="${borderThickness}" height="${height - (borderThickness * 2)}" fill="url(#geometricPattern)" />
          `;
        
        case 'rounded':
          // Los bordes redondeados ya se aplican en los rectángulos individuales
          return '';
        
        case 'none':
        default:
          return '';
      }
    }
    
    // Generar el patrón geométrico seleccionado
    const geometricPatternSvg = createGeometricPattern(geometricPattern);
    
    // Sistema de colores mejorado con múltiples esquemas profesionales
    const colorSchemes = {
      professional: {
        mainBoxFill: 'rgba(255, 255, 255, 0.92)',
        mainTextColor: '#1a202c',
        accentColor: '#76685d',
        priceBoxFill: 'rgba(200, 200, 200, 0.7)',
        priceTextColor: '#000000',
        corredoresBoxFill: 'rgba(50, 50, 50, 0.7)',
        corredoresTextColor: '#FFFFFF'
      },
      elegant: {
        mainBoxFill: 'rgba(255, 255, 255, 0.88)',
        mainTextColor: '#2d3748',
        accentColor: '#8b7355',
        priceBoxFill: '#2c5282',
        priceTextColor: '#FFFFFF',
        corredoresBoxFill: '#2c5282',
        corredoresTextColor: '#FFFFFF'
      },
      modern: {
        mainBoxFill: 'rgba(255, 255, 255, 0.90)',
        mainTextColor: '#1a1a1a',
        accentColor: '#0066cc',
        priceBoxFill: '#0066cc',
        priceTextColor: '#FFFFFF',
        corredoresBoxFill: '#0066cc',
        corredoresTextColor: '#FFFFFF'
      },
      luxury: {
        mainBoxFill: 'rgba(26, 32, 44, 0.85)',
        mainTextColor: '#f7fafc',
        accentColor: '#d4af37',
        priceBoxFill: '#d4af37',
        priceTextColor: '#1a202c',
        corredoresBoxFill: '#1a202c',
        corredoresTextColor: '#d4af37'
      }
    };
    
    // Seleccionar esquema de color (se puede hacer configurable desde propertyInfo)
    const selectedScheme = colorSchemes[propertyInfo.colorScheme || 'professional'];
    
    // Lógica para modelo premium
    const isPremium = modelType === 'premium';
    let priceBoxFill, priceTextColor, corredoresBoxFill, corredoresTextColor;
    
    if (isPremium) {
      // Esquema premium: tonos más cálidos y menos contrastados para combinar con dorado
      // Aumentar transparencia del fondo de características en 25% (de 0.95 a 0.71)
      selectedScheme.mainBoxFill = 'rgba(255, 255, 255, 0.71)';
      // Fondo del precio: tono cálido y más claro que el anterior para mejor legibilidad con dorado
      priceBoxFill = 'rgba(112,85,58,0.95)'; // #70553A
      priceTextColor = '#D4AF37'; // Dorado metálico elegante (mantener)
      // Fondo del bloque de corredores/agencia: tono complementario y texto en blanco
      corredoresBoxFill = 'rgba(108,79,47,0.92)'; // #6C4F2F
      corredoresTextColor = '#FFFFFF'; // Texto blanco para agencia y teléfono
    } else {
      priceBoxFill = selectedScheme.priceBoxFill;
      priceTextColor = selectedScheme.priceTextColor;
      corredoresBoxFill = selectedScheme.corredoresBoxFill;
      corredoresTextColor = selectedScheme.corredoresTextColor;
    }
    
    const mainBoxFill = selectedScheme.mainBoxFill;
    const mainTextColor = selectedScheme.mainTextColor;

    // Two icon palettes: main (colored) for the top-right box, alt (contrast) for the overlay/corredores box
    const svgIconsAlt = {
      ambientes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l9 8h-3v7h-4v-5H10v5H6v-7H3l9-8z" fill="${textColor}"/></svg>`,
      m2_totales: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="${textColor}" stroke-width="1.5" fill="none"/></svg>`,
      m2_cubiertos: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" stroke="${textColor}" stroke-width="1.5" fill="none"/><path d="M7 7h10v10H7V7z" fill="${textColor}" opacity="0.3"/></svg>`,
      banos: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="${textColor}" stroke-width="1.5" fill="none"/><path d="M8 12h8" stroke="${textColor}" stroke-width="1.5"/><path d="M12 8v8" stroke="${textColor}" stroke-width="1.5"/><path d="M15 9v6" stroke="${textColor}" stroke-width="1"/><path d="M9 9v6" stroke="${textColor}" stroke-width="1"/></svg>`,
      ubicacion: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="${textColor}" stroke-width="1.2" fill="none"/><circle cx="12" cy="9" r="2.5" fill="${textColor}"/></svg>`,
      contacto: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4" stroke="${textColor}" stroke-width="1.2" fill="none"/><path d="M7 10l5 4 5-4" stroke="${textColor}" stroke-width="1.2" fill="none"/></svg>`,
      correo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="${textColor}" stroke-width="1.2" fill="none"/><path d="M3 7l9 6 9-6" stroke="${textColor}" stroke-width="1.2" fill="none"/></svg>`,
      corredores: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zM8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zM16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.98 1.97 3.45V19h6v-2.5C23 14.17 18.33 13 16 13z" fill="${textColor}"/></svg>`,
      antiguedad: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="${textColor}" stroke-width="1.5" fill="none"/><polyline points="12,6 12,12 16,14" stroke="${textColor}" stroke-width="1.5" fill="none"/></svg>`
    };
    const svgIconsMain = {
      precio: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      // Iconos dinámicos por tipo de propiedad
      tipo_casa: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#000000" stroke-width="2" fill="none"/><polyline points="9,22 9,12 15,12 15,22" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      tipo_departamento: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#000000" stroke-width="2" fill="none"/><path d="M9 9h1v1H9zM14 9h1v1h-1zM9 14h1v1H9zM14 14h1v1h-1z" fill="#000000"/><path d="M7 21v-4M17 21v-4" stroke="#000000" stroke-width="2"/></svg>`,
      tipo_local: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" stroke="#000000" stroke-width="2" fill="none"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#000000" stroke-width="2" fill="none"/><path d="M12 11v6" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      tipo_oficina: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21h18" stroke="#000000" stroke-width="2" fill="none"/><path d="M5 21V7l8-4v18" stroke="#000000" stroke-width="2" fill="none"/><path d="M19 21V11l-6-4" stroke="#000000" stroke-width="2" fill="none"/><path d="M9 9v.01M9 12v.01M9 15v.01M13 4v.01M13 7v.01M13 10v.01M13 13v.01M13 16v.01M13 19v.01" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      tipo_terreno: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 20h18" stroke="#000000" stroke-width="2" fill="none"/><path d="M7 16l3-6 2 3 4-7" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="round"/><circle cx="5" cy="18" r="1" fill="#000000"/><circle cx="12" cy="18" r="1" fill="#000000"/><circle cx="19" cy="18" r="1" fill="#000000"/></svg>`,
      tipo_galpon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21h18" stroke="#000000" stroke-width="2" fill="none"/><path d="M3 7l9-4 9 4v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2V7z" stroke="#000000" stroke-width="2" fill="none"/><path d="M12 3v18" stroke="#000000" stroke-width="1" fill="none"/><path d="M8 14h8" stroke="#000000" stroke-width="1" fill="none"/></svg>`,
      // Icono mejorado para ambientes (espacios/habitaciones)
      ambientes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#000000" stroke-width="2" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#000000" stroke-width="2" fill="none"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#000000" stroke-width="2" fill="none"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      // Iconos corregidos de Lucide React exactos
      dormitorios: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4v16" stroke="#000000" stroke-width="2" stroke-linecap="round"/><path d="M2 8h18a2 2 0 0 1 2 2v10" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17h20" stroke="#000000" stroke-width="2" stroke-linecap="round"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      banos: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" stroke="#000000" stroke-width="2" fill="none"/><line x1="10" x2="8" y1="5" y2="7" stroke="#000000" stroke-width="2"/><line x1="2" x2="22" y1="12" y2="12" stroke="#000000" stroke-width="2"/><line x1="7" x2="7" y1="19" y2="21" stroke="#000000" stroke-width="2"/><line x1="17" x2="17" y1="19" y2="21" stroke="#000000" stroke-width="2"/></svg>`,
      cocheras: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 16H9m10 0h3m-3 0c0-1.1-.9-2-2-2s-2 .9-2 2m5 0v2a1 1 0 0 1-1 1h-2m-3-3V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9m16 0H6m0 0c0-1.1-.9-2-2-2s-2 .9-2 2m4 0v3" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="17" r="2" stroke="#000000" stroke-width="2" fill="none"/><circle cx="17" cy="17" r="2" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      m2_totales: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="18" x="3" y="3" rx="2" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      m2_cubiertos: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84z" stroke="#000000" stroke-width="2" fill="none"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" stroke="#000000" stroke-width="2" fill="none"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      ubicacion: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="#000000" stroke-width="2" fill="none"/><circle cx="12" cy="10" r="3" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      contacto: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      correo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="16" x="2" y="4" rx="2" stroke="#000000" stroke-width="2" fill="none"/><path d="m22 7-10 5L2 7" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      corredores: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="#000000" stroke-width="2" fill="none"/><circle cx="9" cy="7" r="4" stroke="#000000" stroke-width="2" fill="none"/><path d="m22 21-3.5-3.5" stroke="#000000" stroke-width="2" fill="none"/><circle cx="17" cy="17" r="3" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      antiguedad: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#000000" stroke-width="2" fill="none"/><polyline points="12,6 12,12 16,14" stroke="#000000" stroke-width="2" fill="none"/></svg>`,
      descripcion: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" stroke="#000000" stroke-width="2" fill="none"/><path d="M12 9v4" stroke="#000000" stroke-width="2" stroke-linecap="round"/><path d="m12 17.02.01 0" stroke="#000000" stroke-width="2" stroke-linecap="round"/></svg>`
    };

    // Función para obtener el icono según el tipo de propiedad
    const getTipoIcon = (tipo) => {
      if (!tipo) return svgIconsMain.tipo_casa;
      switch (tipo.toLowerCase()) {
        case 'casa': return svgIconsMain.tipo_casa;
        case 'departamento': return svgIconsMain.tipo_departamento;
        case 'local comercial': return svgIconsMain.tipo_local;
        case 'oficina': return svgIconsMain.tipo_oficina;
        case 'terreno': return svgIconsMain.tipo_terreno;
        case 'galpón': return svgIconsMain.tipo_galpon;
        default: return svgIconsMain.tipo_casa; // Fallback a casa
      }
    };

    const lines = [];
    // Tamaños de fuente adaptativos mejorados para ocupar ~25% de la imagen
    // Factor de escala basado en el área de la imagen para mejor proporción
    const imageArea = width * height;
    const baseScale = Math.sqrt(imageArea) / 100;
    
    // Tamaños de fuente aumentados especialmente para el modelo premium
    const precioSize = isPremium 
      ? Math.max(36, Math.min(60, Math.floor(width / 16)))  // 25% reducción en premium (80 * 0.75 = 60, 48 * 0.75 = 36)
      : Math.max(36, Math.min(72, Math.floor(width / 18 * finalScaleFactor * baseScale / 10)));
    const infoSize = Math.max(20, Math.min(38, Math.floor(width / 28 * finalScaleFactor * baseScale / 10)));
    const contactoSize = Math.max(16, Math.min(28, Math.floor(width / 35 * finalScaleFactor * baseScale / 10)));
    const labelSize = Math.max(14, Math.min(24, Math.floor(width / 45 * finalScaleFactor * baseScale / 10)));
    
    lines.push({ text: `${moneda} ${formatPrice(precio)}`, cls: 'precio', size: precioSize });

    // Combinar tipo y antigüedad si existe antigüedad
    const tipoText = tipo; // Solo tipo, antigüedad separada
    lines.push({ icon: getTipoIcon(tipo), text: tipoText, cls: 'info', size: infoSize });

    if (antiguedad) lines.push({ icon: svgIconsMain.antiguedad, text: `${antiguedad} años`, cls: 'info', size: infoSize });

    if (ambientes) lines.push({ icon: svgIconsMain.ambientes, text: `${ambientes} ambientes`, cls: 'info', size: infoSize });
    if (dormitorios) lines.push({ icon: svgIconsMain.dormitorios, text: `${dormitorios} dormitorios`, cls: 'info', size: infoSize });
    if (banos) lines.push({ icon: svgIconsMain.banos, text: `${banos} baños`, cls: 'info', size: infoSize });
    if (cocheras) lines.push({ icon: svgIconsMain.cocheras, text: `${cocheras} cocheras`, cls: 'info', size: infoSize });
    if (m2_totales) lines.push({ icon: svgIconsMain.m2_totales, text: `${m2_totales} m`, superscript: '2', suffix: ' totales', cls: 'info', size: infoSize });
    if (m2_cubiertos) lines.push({ icon: svgIconsMain.m2_cubiertos, text: `${m2_cubiertos} m`, superscript: '2', suffix: ' cubiertos', cls: 'info', size: infoSize });
    if (direccion) lines.push({ icon: svgIconsMain.ubicacion, text: direccion, cls: 'contacto', size: contactoSize });
    if (contacto) lines.push({ icon: svgIconsMain.contacto, text: contacto, cls: 'contacto', size: contactoSize });
    if (email) lines.push({ icon: svgIconsMain.correo, text: email, cls: 'contacto', size: contactoSize });

    // Calcular ancho máximo para el box
    // Tamaño de icono dinámico para cálculo de ancho
    const iconSizeCalc = Math.max(20, Math.min(36, Math.floor(infoSize * 1.2)));
    const iconSpacingCalc = Math.floor(iconSizeCalc * 1.3);
    
    let maxLineWidth = 0;
    for (const ln of lines) {
      if (ln.cls === 'precio') continue;
      const textWidth = ln.text.length * (ln.size * 0.65) + (ln.icon ? iconSpacingCalc : 0) + 60;
      if (textWidth > maxLineWidth) maxLineWidth = textWidth;
    }

    // Corredores will be rendered in a separate box bottom-left
    const corredoresText = corredores || null;

    // Crear dos boxes: uno para precio (arriba derecha) y otro para info (abajo)
    // Aumentar margen y padding para mejor visibilidad
    const margin = Math.max(25, Math.floor(width / 40));
    const padding = Math.max(20, Math.floor(28 * finalScaleFactor));
    // Espaciado entre líneas adaptativo mejorado
    const lineHeight = Math.max(28, Math.floor((width / 35) * finalScaleFactor) - Math.floor(fieldCount / 5));

    // Calcular tamaño dinámico del box de precio - más grande para mejor visibilidad
    const precioText = `${moneda} ${formatPrice(precio)}`;
    const precioTextWidth = precioText.length * Math.floor(precioSize * 0.65);
    const precioBoxWidth = isPremium
      ? Math.max(263, Math.min(precioTextWidth + padding * 4, Math.floor(width * 0.375)))  // 25% reducción en premium (0.50 * 0.75 = 0.375, 350 * 0.75 = 262.5)
      : Math.max(280, Math.min(precioTextWidth + padding * 3, Math.floor(width * 0.45)));
    const precioBoxHeight = isPremium
      ? Math.max(90, Math.floor(height * 0.135))  // 25% reducción en premium (0.18 * 0.75 = 0.135, 120 * 0.75 = 90)
      : Math.max(100, Math.floor(height * 0.15));
    const precioBoxX = width - precioBoxWidth - margin;
    const precioBoxY = margin;

    // Calcular el número real de líneas con contenido para ajustar el box
    let infoLineCount = 0;
    if (tipo) infoLineCount++;
    if (antiguedad) infoLineCount++;
    if (ambientes) infoLineCount++;
    if (dormitorios) infoLineCount++;
    if (banos) infoLineCount++;
    if (cocheras) infoLineCount++;
    if (m2_totales) infoLineCount++;
    if (m2_cubiertos) infoLineCount++;
    if (direccion) infoLineCount++;
    if (contacto) infoLineCount++;
    if (email) infoLineCount++;

    const infoBoxWidth = Math.max(450, maxLineWidth);
    // Usar espaciado adaptativo calculado anteriormente - aumentar altura para ~25% de la imagen
    const infoBoxHeight = Math.max(150, Math.min(infoLineCount * (lineHeight + adaptiveSpacing) + padding * 3, Math.floor(height * 0.55)));
    const infoBoxX = width - infoBoxWidth - margin;
    const infoBoxY = precioBoxY + precioBoxHeight + Math.floor(margin / 2);

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:lang="es">\n`;
    
    // Agregar patrón geométrico si existe
    if (geometricPatternSvg) {
      svg += geometricPatternSvg;
    }
    
    svg += `  <defs>\n`;
    svg += `    <linearGradient id="g1" x1="0%" y1="0%" x2="0%" y2="100%">\n`;
    svg += `      <stop offset="0%" stop-color="rgba(0,0,0,0.6)" />\n`;
    svg += `      <stop offset="100%" stop-color="rgba(0,0,0,0.4)" />\n`;
    svg += `    </linearGradient>\n`;
    svg += `    <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">\n`;
    svg += `      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.45" />\n`;
    svg += `    </filter>\n`;
    
    // Filtro de sombra premium
    if (isPremium) {
      svg += `    <filter id="premiumShadow">\n`;
      svg += `      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.6" />\n`;
      svg += `    </filter>\n`;
    }
    
    svg += `    <style><![CDATA[\n`;
    svg += `      .precio { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${precioSize}px; font-weight: 700; fill: ${mainTextColor}; }\n`;
    svg += `      .info { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${infoSize}px; fill: ${mainTextColor}; font-weight: 600; }\n`;
    svg += `      .contacto { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${contactoSize}px; fill: ${mainTextColor}; font-weight: 500; }\n`;
    svg += `      .label { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${labelSize}px; fill: ${mainTextColor}; opacity: 0.9; font-weight: 600; }\n`;
    if (isPremium) {
      svg += `      .premium { font-family: 'Playfair Display', 'Times New Roman', serif; font-weight: 700; letter-spacing: 0.5px; }\n`;
      svg += `      .premium-price { font-family: 'Montserrat', 'Arial Black', sans-serif; font-weight: 900; }\n`;
      svg += `      .premium-info { font-family: 'Roboto', 'Arial', sans-serif; font-weight: 600; }\n`;
    }
    svg += `    ]]></style>\n`;
    svg += `  </defs>\n`;

    svg += `  <g filter="${isPremium ? 'url(#premiumShadow)' : 'url(#f1)'}">\n`;
    // Box para precio (arriba derecha) - usar color del esquema seleccionado
    svg += `    <rect x="${precioBoxX}" y="${precioBoxY}" width="${precioBoxWidth}" height="${precioBoxHeight}" rx="${isPremium ? '16' : '14'}" fill="${priceBoxFill}" opacity="1" stroke="${isPremium ? 'rgba(212,175,55,0.5)' : 'rgba(0,0,0,0.15)'}" stroke-width="${isPremium ? '2' : '1.5'}" />\n`;
    // Box para información (abajo)
    svg += `    <rect x="${infoBoxX}" y="${infoBoxY}" width="${infoBoxWidth}" height="${infoBoxHeight}" rx="${isPremium ? '16' : '14'}" fill="${mainBoxFill}" opacity="1" stroke="${isPremium ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.12)'}" stroke-width="${isPremium ? '2' : '1.5'}" />\n`;
    svg += `  </g>\n`;

    // Dibujar precio en su box con mejor diseño
    // Centrar el texto del precio en el medio del box
    const precioCenterX = precioBoxX + precioBoxWidth / 2;
    const precioCenterY = precioBoxY + precioBoxHeight / 2;

    // Mejor diseño del precio con color blanco sobre fondo personalizado
    svg += `  <defs>\n`;
    svg += `    <filter id="precioShadow" x="-20%" y="-20%" width="140%" height="140%">\n`;
    svg += `      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3" />\n`;
    svg += `    </filter>\n`;
    svg += `  </defs>\n`;

    // Para premium, calcular el tamaño de fuente que mejor llene el box
    let finalPrecioSize = precioSize;
    if (isPremium) {
      // Calcular tamaño de fuente basado en el espacio disponible
      const availableWidth = precioBoxWidth - (padding * 2);
      const availableHeight = precioBoxHeight - (padding * 2);
      
      // Estimar ancho del texto (aproximadamente 0.6 del font-size por carácter)
      const estimatedCharWidth = precioSize * 0.6;
      const estimatedTextWidth = precioText.length * estimatedCharWidth;
      
      // Si el texto es más grande que el espacio disponible, ajustar
      if (estimatedTextWidth > availableWidth) {
        finalPrecioSize = Math.floor((availableWidth / precioText.length) / 0.6);
      }
      
      // Asegurar que use el 80% del espacio disponible en altura como mínimo
      const minSizeByHeight = Math.floor(availableHeight * 0.8);
      if (finalPrecioSize < minSizeByHeight && precioText.length < 15) {
        finalPrecioSize = minSizeByHeight;
      }
      
      // Límites para el tamaño - reducidos 25% en premium
      finalPrecioSize = Math.max(30, Math.min(67, finalPrecioSize));  // 40 * 0.75 = 30, 90 * 0.75 = 67
    }

    // Texto del precio centrado con color específico para cada modelo y tamaño calculado
    svg += `  <text x="${precioCenterX}" y="${precioCenterY + finalPrecioSize * 0.35}" text-anchor="middle" filter="url(#precioShadow)" class="${isPremium ? 'premium-price' : 'precio'}" style="fill: ${priceTextColor}; font-size: ${finalPrecioSize}px;">${escapeForSvg(precioText)}</text>\n`;

    // Dibujar información en su box (ahora con wrapping y cálculo de alto dinámico)
    const infoX = infoBoxX + padding;
    // Filtrar líneas que no son precio
    const infoLines = lines.filter(ln => ln.cls !== 'precio');

    // Calcular ancho útil para texto dentro del box - aumentado para mejor visibilidad
    const maxInfoWidthCap = Math.floor(width * 0.65);
    const effectiveInfoBoxWidth = Math.max(450, Math.min(maxLineWidth, maxInfoWidthCap));
    const maxTextWidth = Math.max(120, effectiveInfoBoxWidth - padding * 3 - 35);

    // Calcular cuántas líneas renderizadas ocupará realmente el contenido (considerando wrapping)
    let renderedLinesCount = 0;
    const linesWrapCache = []; // store wrapped parts per line
    for (const ln of infoLines) {
      const fontApprox = Math.max(10, Math.floor((ln.size || infoSize) * 0.6));
      const estPixels = String(ln.text || '').length * fontApprox;
      const estLines = Math.max(1, Math.ceil(estPixels / maxTextWidth));
      // perform an actual word-wrap by chars approximation to render later
      const maxCharsPerLine = Math.max(8, Math.floor(maxTextWidth / Math.max(6, fontApprox)));
      const words = String(ln.text || '').split(/\s+/);
      const parts = [];
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).trim().length <= maxCharsPerLine) {
          cur = (cur + ' ' + w).trim();
        } else {
          if (cur) parts.push(cur);
          if (w.length > maxCharsPerLine) {
            for (let i = 0; i < w.length; i += maxCharsPerLine) parts.push(w.slice(i, i + maxCharsPerLine));
            cur = '';
          } else {
            cur = w;
          }
        }
      }
      if (cur) parts.push(cur);
      if (parts.length === 0) parts.push('');
      linesWrapCache.push({ ln, parts });
      renderedLinesCount += parts.length;
    }

    // Recalculate final infoBoxHeight based on renderedLinesCount
    const computedInfoBoxHeight = Math.max(80, renderedLinesCount * (lineHeight + adaptiveSpacing) + padding * 2);
    const maxAllowedHeight = Math.max(Math.floor(height * 0.75), computedInfoBoxHeight);
    const infoBoxHeightFinal = Math.min(computedInfoBoxHeight, height - precioBoxHeight - margin - 10);
    // Use final effective width as earlier computed
    const finalInfoBoxWidth = effectiveInfoBoxWidth;
    const finalInfoBoxX = width - finalInfoBoxWidth - margin;
    const finalInfoBoxY = precioBoxY + precioBoxHeight + 10;

    // Replace previous box rect if width/height changed
    svg = svg.replace(`    <rect x="${infoBoxX}" y="${infoBoxY}" width="${infoBoxWidth}" height="${infoBoxHeight}" rx="14" fill="${mainBoxFill}" opacity="1" stroke="rgba(0,0,0,0.12)" stroke-width="1.5" />\n`, `    <rect x="${finalInfoBoxX}" y="${finalInfoBoxY}" width="${finalInfoBoxWidth}" height="${infoBoxHeightFinal}" rx="14" fill="${mainBoxFill}" opacity="1" stroke="rgba(0,0,0,0.12)" stroke-width="1.5" />\n`);

    // Ahora renderizamos las líneas envueltas dentro del box
    let cursorY = finalInfoBoxY + padding + Math.floor(lineHeight / 2);
    const baseTextX = finalInfoBoxX + padding;
    // Calcular tamaño de icono dinámico basado en el tamaño de fuente
    const iconSize = Math.max(20, Math.min(36, Math.floor(infoSize * 1.2)));
    const iconSpacing = Math.floor(iconSize * 1.3);
    
    for (let idx = 0; idx < linesWrapCache.length; idx++) {
      const { ln, parts } = linesWrapCache[idx];
      let iconSvg = ln.icon && (ln.icon.startsWith('<svg') ? ln.icon : svgIconsMain[ln.icon]) ? (ln.icon.startsWith('<svg') ? ln.icon : svgIconsMain[ln.icon]) : null;
      
      // Escalar el icono SVG dinámicamente
      if (iconSvg) {
        iconSvg = iconSvg.replace(/width="18" height="18"/, `width="${iconSize}" height="${iconSize}"`);
      }
      
      for (let p = 0; p < parts.length; p++) {
        const part = escapeForSvg(parts[p]);
        const textX = baseTextX + (iconSvg && p === 0 ? iconSpacing : 0);
        if (iconSvg && p === 0) {
          const iconX = baseTextX;
          const iconY = cursorY - Math.floor((ln.size || infoSize) * 0.75);
          svg += `  <g transform="translate(${iconX}, ${iconY})">${iconSvg}</g>\n`;
        }
        if (ln.cls === 'label') {
          svg += `  <text x="${textX}" y="${cursorY}" class="label">${part}</text>\n`;
        } else if (ln.superscript && p === 0) {
          const safeSuffix = escapeForSvg(ln.suffix || '');
          svg += `  <text x="${textX}" y="${cursorY}" class="${ln.cls}">${part}<tspan dy="-0.3em" font-size="0.7em">${ln.superscript}</tspan><tspan dy="0.3em" dx="2">${safeSuffix}</tspan></text>\n`;
        } else {
          svg += `  <text x="${textX}" y="${cursorY}" class="${ln.cls}">${part}</text>\n`;
        }
        cursorY += (lineHeight + adaptiveSpacing); // Usar espaciado adaptativo
      }
    }

    // Render corredores box bottom-center if present (como disclaimer pequeño)
    if (corredoresText) {
      // Tamaño de fuente más pequeño para que sea un disclaimer discreto
      const corrFontSize = Math.max(14, Math.floor((width / 65) * finalScaleFactor * baseScale / 10));
      const corrChar = Math.max(7, Math.floor(corrFontSize * 0.65));
      const corrMargin = Math.max(25, Math.floor(width / 40));
      const maxCorrBoxW = Math.min(Math.floor(width * 0.6), 550);
      const estW = corredoresText.length * corrChar + padding * 2.5;
      const cW = Math.min(maxCorrBoxW, Math.max(200, estW));
      const cMaxChars = Math.max(20, Math.floor((cW - padding * 2.5) / corrChar));
      // split into parts
      const safeCorr = escapeForSvg(corredoresText);
      // word-wrap based on cMaxChars estimate
      const words = safeCorr.split(/\s+/);
      const corrParts = [];
      let line = '';
      for (const w of words) {
        if ((line + ' ' + w).trim().length <= cMaxChars) {
          line = (line + ' ' + w).trim();
        } else {
          if (line) corrParts.push(line);
          // if single word longer than cMaxChars, hard-split
          if (w.length > cMaxChars) {
            for (let i = 0; i < w.length; i += cMaxChars) corrParts.push(w.slice(i, i + cMaxChars));
            line = '';
          } else {
            line = w;
          }
        }
      }
      if (line) corrParts.push(line);
      const cH = Math.max(40, corrParts.length * (Math.max(16, corrFontSize) + Math.floor(adaptiveSpacing * 0.7)) + padding * 1.5);
      
      // Posicionar en el centro inferior, con margen suficiente desde el bottom
      const bottomMargin = Math.max(corrMargin * 1.5, 40);
      const cY = height - bottomMargin;
      
      // compute final width to accommodate the longest wrapped part (by chars -> pixels estimate)
      let maxPartLen = 0;
      for (const p of corrParts) if (p.length > maxPartLen) maxPartLen = p.length;
      // Use a more generous character width estimate and add extra margin
      const charWidthGenerous = Math.max(8, Math.floor(corrFontSize * 0.65));
      const neededForParts = maxPartLen * charWidthGenerous + padding * 2.5;
      const finalCW = Math.min(maxCorrBoxW, Math.max(cW, neededForParts, 200));
      
      // Centrar horizontalmente
      const cX = Math.floor((width - finalCW) / 2);
      
      // draw rect with final width - usar color del esquema seleccionado con mayor transparencia para disclaimer
      const disclaimerOpacity = isPremium ? '0.85' : '0.92';
      svg += `  <g filter="url(#f1)">\n`;
      svg += `    <rect x="${cX}" y="${cY - cH}" width="${finalCW}" height="${cH}" rx="6" fill="${corredoresBoxFill}" opacity="${disclaimerOpacity}" stroke="rgba(0,0,0,0.12)" stroke-width="1" />\n`;
      svg += `  </g>\n`;
      // icon and text centered horizontally and vertically
      const centerY = cY - cH + cH / 2;
      const lineSpacing = Math.max(16, corrFontSize) + Math.floor(adaptiveSpacing * 0.7);
      const totalLinesHeight = (corrParts.length - 1) * lineSpacing;
      let startY = Math.floor(centerY - totalLinesHeight / 2);
      for (let i = 0; i < corrParts.length; i++) {
        const lineY = startY + i * lineSpacing;
        const textCenterX = cX + finalCW / 2;
        svg += `  <text x="${textCenterX}" y="${lineY}" text-anchor="middle" dominant-baseline="middle" style="font-family: 'DejaVu Sans', Arial, sans-serif; font-size:${corrFontSize}px; font-weight: 500; fill: ${corredoresTextColor};">${corrParts[i]}</text>\n`;
      }
    }

    const origenText = 'Rialtor.app';
    const origenSafe = escapeForSvg(origenText);
    const origenSize = Math.max(14, Math.floor(width / 60 * baseScale / 10));
    const originMargin = Math.max(18, Math.floor(width / 60));
    const origenX = width - originMargin;
    const origenY = height - originMargin;

    // Render descripcion bottom-right (above logo) if present
    if (descripcion) {
      const descSafe = escapeForSvg(descripcion);
      const descSize = Math.max(16, Math.floor(width / 50 * baseScale / 10));
      const descPadding = Math.max(16, Math.floor(padding * 0.8));

      // Calculate description box dimensions - aumentar ancho máximo
      const maxDescWidth = Math.min(Math.floor(width * 0.5), 450);
      const charWidth = Math.max(8, Math.floor(descSize * 0.6));
      const maxCharsPerLine = Math.floor((maxDescWidth - descPadding * 2) / charWidth);

      // Word wrap description
      const words = descSafe.split(/\s+/);
      const descLines = [];
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) descLines.push(currentLine);
          currentLine = word.length > maxCharsPerLine ? word.slice(0, maxCharsPerLine - 1) + '…' : word;
        }
      }
      if (currentLine) descLines.push(currentLine);

      const descBoxHeight = Math.max(50, descLines.length * (descSize + 8) + descPadding * 2);
      const descBoxWidth = Math.min(maxDescWidth, Math.max(200, descLines.reduce((max, line) => Math.max(max, line.length * charWidth), 0) + descPadding * 2));
      const descX = width - descBoxWidth - originMargin;
      const descY = height - descBoxHeight - originMargin - origenSize - 8;

      // Draw description box with translucent white background
      svg += `  <g filter="url(#f1)">\n`;
      svg += `    <rect x="${descX}" y="${descY}" width="${descBoxWidth}" height="${descBoxHeight}" rx="10" fill="rgba(255,255,255,0.65)" opacity="1" stroke="rgba(0,0,0,0.1)" stroke-width="1" />\n`;
      svg += `  </g>\n`;

      // Add description text without icon
      let descCurrentY = descY + descPadding + Math.floor(descSize * 0.9);
      const descTextX = descX + descPadding;
      for (let i = 0; i < descLines.length; i++) {
        svg += `  <text x="${descTextX}" y="${descCurrentY}" style="font-family: 'DejaVu Sans', Arial, sans-serif; font-size: ${descSize}px; fill: #000000; font-weight: 400;">${descLines[i]}</text>\n`;
        descCurrentY += descSize + 8; // Más espacio entre líneas
      }
    }

    // Box para origen bottom-right
    const origenBoxWidth = origenText.length * (origenSize * 0.65) + 48;
    const origenBoxHeight = Math.max(40, origenSize + 24);
    const origenBoxX = width - origenBoxWidth - originMargin;
    const origenBoxY = height - origenBoxHeight - originMargin;
    svg += `  <g filter="url(#f1)">\n`;
    svg += `    <rect x="${origenBoxX}" y="${origenBoxY}" width="${origenBoxWidth}" height="${origenBoxHeight}" rx="10" fill="rgba(50, 50, 50, 0.75)" opacity="1" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />\n`;
    svg += `  </g>\n`;

    svg += `  <text x="${origenBoxX + 14}" y="${origenBoxY + origenSize + 8}" text-anchor="start" style="font-family: 'DejaVu Sans', Arial, sans-serif; font-size: ${origenSize}px; font-weight: 600; fill: #FFFFFF;">${origenSafe}</text>\n`;

    // Agregar marca en esquina superior izquierda si existe
    if (brand) {
      const brandSafe = escapeForSvg(brand);
      const brandSize = Math.max(18, Math.floor(width / 40 * baseScale / 10));
      const brandMargin = Math.max(25, Math.floor(width / 40));
      const brandX = brandMargin;
      const brandY = brandMargin + brandSize;
      
      // Calcular ancho del texto de forma más conservadora para asegurar que quepa
      const approxCharWidth = brandSize * 0.75; // Factor más alto para asegurar que quepa
      const brandTextWidth = brandSafe.length * approxCharWidth;
      const brandBoxWidth = brandTextWidth + 40; // Más padding extra para seguridad
      const brandBoxHeight = brandSize + 28;
      
      // Fondo con opacidad del 50%
      svg += `  <rect x="${brandX - 20}" y="${brandY - brandSize - 16}" width="${brandBoxWidth}" height="${brandBoxHeight}" rx="8" fill="rgba(255,255,255,0.5)" stroke="rgba(0,0,0,0.1)" stroke-width="1.5" />\n`;
      
      svg += `  <text x="${brandX}" y="${brandY}" text-anchor="start" style="font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${brandSize}px; font-weight: 700; fill: #000000;">${brandSafe}</text>\n`;
    }

    // Zócalo del agente para modelo premium
    if (isPremium && propertyInfo.agentImage) {
      const agentBoxHeight = Math.floor(height * 0.24); // 24% inferior - más espacio
      const agentBoxY = height - agentBoxHeight;
      const agentImageSize = 110; // Imagen mucho más grande
      const agentX = 60;
      const agentY = agentBoxY + (agentBoxHeight - agentImageSize) / 2; // Centrar verticalmente
      const textX = agentX + agentImageSize + 40;

      // Fondo del zócalo con gradiente elegante más sutil - tono cálido premium
      svg += `  <rect x="0" y="${agentBoxY}" width="${width}" height="${agentBoxHeight}" fill="rgba(112,85,58,0.95)" opacity="1" />\n`;
      
      // Línea superior decorativa dorada más gruesa - Dorado metálico elegante
      svg += `  <line x1="0" y1="${agentBoxY}" x2="${width}" y2="${agentBoxY}" stroke="#D4AF37" stroke-width="4" opacity="1" />\n`;

      // Marco y fondo blanco para la imagen del agente (la imagen se compondrá después con Sharp)
      const frameCenterX = agentX + agentImageSize/2;
      const frameCenterY = agentY + agentImageSize/2;
      
      // Fondo blanco sólido para el círculo - MÁS GRANDE
      svg += `  <circle cx="${frameCenterX}" cy="${frameCenterY}" r="${agentImageSize/2 + 6}" fill="#FFFFFF" />\n`;
      
      // Marco dorado exterior - MÁS GRUESO - Dorado metálico elegante
      svg += `  <circle cx="${frameCenterX}" cy="${frameCenterY}" r="${agentImageSize/2 + 7}" fill="none" stroke="#D4AF37" stroke-width="5" opacity="1" />\n`;
      
      // NOTA: La imagen del agente se compondrá después con Sharp, no con SVG

      // Texto del agente con mejor diseño y tamaños MUCHO MÁS GRANDES
      const agentName = escapeForSvg(propertyInfo.agentName || 'Agente Inmobiliario');
      const agency = escapeForSvg(propertyInfo.agency || 'Agencia Inmobiliaria');
      const agentContact = escapeForSvg(propertyInfo.agentContact || '');
      
      const textY = agentY + 30; // Posición Y base para el texto
      
      // Nombre del agente con efecto de brillo y sombra para legibilidad - MÁS GRANDE - Dorado metálico
      svg += `  <text x="${textX}" y="${textY}" class="premium" style="font-size: 32px; fill: #D4AF37; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(212,175,55,0.6);">${agentName}</text>\n`;
      
      // Agencia con fuente más grande y elegante con sombra - texto en blanco para contraste
      svg += `  <text x="${textX}" y="${textY + 42}" style="font-family: 'Roboto', 'Arial', sans-serif; font-size: 22px; fill: #FFFFFF; font-weight: 500; text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">${agency}</text>\n`;
      
      // Contacto si existe con mejor contraste - texto blanco
      if (agentContact) {
        svg += `  <text x="${textX}" y="${textY + 72}" style="font-family: 'Roboto', 'Arial', sans-serif; font-size: 18px; fill: #FFFFFF; opacity: 1; text-shadow: 2px 2px 3px rgba(0,0,0,0.9);">${agentContact}</text>\n`;
      }

      // Logo de Rialtor.app en el extremo derecho del zócalo con sombra - MÁS GRANDE - Dorado metálico
      const logoX = width - 60;
      const logoY = agentBoxY + agentBoxHeight / 2 + 10;
      svg += `  <text x="${logoX}" y="${logoY}" style="font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: 26px; font-weight: 700; fill: #D4AF37; text-anchor: end; text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">Rialtor.app</text>\n`;
    }

    svg += `</svg>`;
    return svg;
  } catch (e) {
    console.error('[PLACAS] createPlaqueSvgString error:', e);
    throw e;
  }
}

/**
 * Crear placa VIP usando el template como base (desde buffer)
 * @param {Buffer} templateBuffer - Buffer del template de fondo
 * @param {object} propertyInfo - Datos de la propiedad
 * @param {Buffer} interiorImageBuffer - Buffer de la imagen del interior
 * @param {Buffer} exteriorImageBuffer - Buffer de la imagen del exterior  
 * @param {Buffer} agentImageBuffer - Buffer de la imagen del agente (opcional)
 * @returns {Promise<Buffer>} Buffer de la imagen final
 */
async function createVIPPlaqueOverlayFromBuffer(templateBuffer, propertyInfo, interiorImageBuffer, exteriorImageBuffer, agentImageBuffer) {
  try {
    console.log('[PLACAS VIP] Iniciando creación de placa VIP desde buffer');
    
    return await createVIPPlaqueOverlayFromBufferActual(templateBuffer, propertyInfo, interiorImageBuffer, exteriorImageBuffer, agentImageBuffer);
    
  } catch (error) {
    console.error('[PLACAS VIP] Error creando placa VIP desde buffer:', error);
    throw error;
  }
}

/**
 * Crear placa VIP usando el template como base (desde archivo)
 * @param {string} templatePath - Ruta al template de fondo
 * @param {object} propertyInfo - Datos de la propiedad
 * @param {Buffer} interiorImageBuffer - Buffer de la imagen del interior
 * @param {Buffer} exteriorImageBuffer - Buffer de la imagen del exterior  
 * @param {Buffer} agentImageBuffer - Buffer de la imagen del agente (opcional)
 * @returns {Promise<Buffer>} Buffer de la imagen final
 */
async function createVIPPlaqueOverlay(templatePath, propertyInfo, interiorImageBuffer, exteriorImageBuffer, agentImageBuffer) {
  try {
    console.log('[PLACAS VIP] Iniciando creación de placa VIP desde archivo');
    
    // Cargar el template base
    const templateBuffer = require('fs').readFileSync(templatePath);
    
    // Usar la función desde buffer
    return await createVIPPlaqueOverlayFromBuffer(templateBuffer, propertyInfo, interiorImageBuffer, exteriorImageBuffer, agentImageBuffer);
  } catch (error) {
    console.error('[PLACAS VIP] Error creando placa VIP:', error);
    throw error;
  }
}

// Función auxiliar que contiene la lógica real de composición
async function createVIPPlaqueOverlayFromBufferActual(templateBuffer, propertyInfo, interiorImageBuffer, exteriorImageBuffer, agentImageBuffer) {
  try {
    // DISEÑO PREMIUM INSPIRADO EN IMAGEN DE REFERENCIA
    // Layout optimizado con proporciones áureas y diseño editorial
    // - Imagen EXTERIOR: 55% del alto (595px) - hero principal
    // - Imagen INTERIOR: círculo de 200px con borde dorado elegante
    // - Área de CONTENIDO: 32% del alto (345px) - info de propiedad
    // - FOOTER: 13% del alto (140px) - contacto y branding
    
    const width = 1080;
    const height = 1080;
    
    console.log('[PLACAS VIP] Creando placa VIP premium con diseño editorial');
    
    // === SISTEMA DE PROPORCIÓN ÓPTIMA ===
    const exteriorHeight = 588;        // Altura interna (sin borde inferior)
    const contentHeight = 380;         // Más espacio para información
    const footerHeight = 112;          // Footer más compacto
    
    const contentY = exteriorHeight + 12; // +12px del borde superior
    const footerY = contentY + contentHeight;
    
    // 1. Imagen EXTERIOR con BORDE BLANCO SOLO ARRIBA Y LATERALES
    const borderSize = 12; // Borde blanco de 12px en top, left, right
    const exteriorInnerWidth = width - (borderSize * 2);
    const exteriorInnerHeight = exteriorHeight; // Sin restar borde inferior
    
    // Procesar imagen exterior
    const exteriorImg = await sharp(exteriorImageBuffer)
      .resize(exteriorInnerWidth, exteriorInnerHeight, {
        fit: 'cover',
        position: 'center'
      })
      // Aplicar mejora sutil de brillo y contraste
      .modulate({
        brightness: 1.02,
        saturation: 1.05
      })
      .sharpen({ sigma: 0.5 })
      .png({ quality: 95 })
      .toBuffer();
    
    // Crear canvas con borde blanco solo arriba y laterales (NO abajo)
    const exteriorWithBorder = await sharp({
      create: {
        width: width,
        height: exteriorHeight + borderSize, // +12px solo para borde superior
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Fondo blanco
      }
    })
    .composite([{
      input: exteriorImg,
      top: borderSize,  // Borde superior
      left: borderSize  // Borde izquierdo
    }])
    .png({ quality: 95 })
    .toBuffer();
    
    const exteriorProcessed = exteriorWithBorder;
    
    // 2. Imagen INTERIOR circular premium con borde dorado refinado
    const interiorCircleSize = 190; // Tamaño más balanceado
    const interiorX = width - interiorCircleSize - 45; // Posición optimizada
    const interiorY = 45; // Posición balanceada desde el borde superior
    
    // === TARJETA DE PRECIO PREMIUM ===
    const priceCardWidth = 195;  // 25% reducción (260 * 0.75 = 195)
    const priceCardHeight = 98;  // 25% reducción (130 * 0.75 = 97.5)
    const priceCardX = width - priceCardWidth - 45;
    const priceCardY = exteriorHeight - priceCardHeight - 45;
    
    // Crear canvas para la imagen interior circular
    const interiorCanvas = await sharp({
      create: {
        width: interiorCircleSize,
        height: interiorCircleSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .png()
    .toBuffer();
    
    // Procesar imagen interior con tratamiento profesional
    const interiorResized = await sharp(interiorImageBuffer)
      .resize(interiorCircleSize, interiorCircleSize, {
        fit: 'cover',
        position: 'center'
      })
      // Aplicar mejora sutil
      .modulate({
        brightness: 1.02,
        saturation: 1.03
      })
      .sharpen({ sigma: 0.5 })
      .png({ quality: 95 })
      .toBuffer();
    
    // Crear máscara circular perfecta
    const circleMask = Buffer.from(
      `<svg width="${interiorCircleSize}" height="${interiorCircleSize}">
        <circle cx="${interiorCircleSize/2}" cy="${interiorCircleSize/2}" r="${(interiorCircleSize/2) - 10}" fill="white"/>
      </svg>`
    );
    
    // Aplicar máscara circular
    const interiorCircular = await sharp(interiorResized)
      .composite([{
        input: circleMask,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
    
    // Crear borde dorado FINO Y ELEGANTE - diseño minimalista
    const goldenBorder = Buffer.from(
      `<svg width="${interiorCircleSize}" height="${interiorCircleSize}">
        <defs>
          <!-- Gradiente dorado champagne suave -->
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#d4af37;stop-opacity:1" />
            <stop offset="30%" style="stop-color:#f4e5a8;stop-opacity:1" />
            <stop offset="60%" style="stop-color:#d4af37;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#c9a227;stop-opacity:1" />
          </linearGradient>
          
          <!-- Sombra suave -->
          <filter id="circleShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5"/>
            <feOffset dx="0" dy="3" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.15"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Sombra sutil -->
        <circle cx="${interiorCircleSize/2}" cy="${interiorCircleSize/2}" r="${(interiorCircleSize/2) - 4}" 
                fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="8" filter="url(#circleShadow)"/>
        
        <!-- Borde dorado fino principal -->
        <circle cx="${interiorCircleSize/2}" cy="${interiorCircleSize/2}" r="${(interiorCircleSize/2) - 5}" 
                fill="none" stroke="url(#goldGradient)" stroke-width="4"/>
        
        <!-- Borde interno blanco delgado -->
        <circle cx="${interiorCircleSize/2}" cy="${interiorCircleSize/2}" r="${(interiorCircleSize/2) - 2}" 
                fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="1.5"/>
        
        <!-- Highlight superior sutil -->
        <path d="M ${interiorCircleSize/2 - 50} ${interiorCircleSize/2 - 65} Q ${interiorCircleSize/2} ${interiorCircleSize/2 - 78} ${interiorCircleSize/2 + 50} ${interiorCircleSize/2 - 65}"
              fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`
    );
    
    // Componer imagen circular + borde dorado
    const interiorWithBorder = await sharp(interiorCanvas)
      .composite([
        {
          input: interiorCircular,
          top: 0,
          left: 0
        },
        {
          input: goldenBorder,
          top: 0,
          left: 0
        }
      ])
      .png()
      .toBuffer();
    
    // 3. Foto del AGENTE con marco PREMIUM editorial (área inferior izquierda)
    // Proporciones optimizadas: ratio 3:4 para retrato profesional
    const agentWidth = 200;   // Ancho balanceado
    const agentHeight = 265;  // Alto proporcional 3:4
    const agentX = 50;        // Margen izquierdo elegante
    // Alinear bottom del agente con el área de características
    const agentY = footerY - agentHeight - 25; // 25px de margen antes del footer
    
    let agentProcessed = null;
    if (agentImageBuffer) {
      // Crear canvas base para el agente
      const agentCanvas = await sharp({
        create: {
          width: agentWidth,
          height: agentHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
      })
      .png()
      .toBuffer();
      
      // Procesar imagen del agente con tratamiento profesional
      const agentImg = await sharp(agentImageBuffer)
        .resize(agentWidth - 16, agentHeight - 16, {
          fit: 'cover',
          position: 'center'
        })
        // Aplicar mejoras sutiles para foto de retrato
        .modulate({
          brightness: 1.03,
          saturation: 0.98
        })
        .sharpen({ sigma: 0.3 })
        .png({ quality: 95 })
        .toBuffer();
      
      // Crear marco EDITORIAL PREMIUM - minimalista y sofisticado
      const agentFrame = Buffer.from(
        `<svg width="${agentWidth}" height="${agentHeight}">
          <defs>
            <!-- Gradiente neutral elegante -->
            <linearGradient id="frameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#4a5568;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#2d3748;stop-opacity:1" />
            </linearGradient>
            
            <!-- Sombra profesional profunda -->
            <filter id="frameShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
              <feOffset dx="0" dy="4" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.22"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <!-- Marco exterior premium con sombra -->
          <rect x="0" y="0" width="${agentWidth}" height="${agentHeight}" 
                fill="url(#frameGradient)" rx="10" filter="url(#frameShadow)"/>
          
          <!-- Highlight superior metálico -->
          <line x1="15" y1="4" x2="${agentWidth - 15}" y2="4" 
                stroke="rgba(255,255,255,0.3)" stroke-width="1.5" stroke-linecap="round"/>
          
          <!-- Área blanca interior elegante -->
          <rect x="8" y="8" width="${agentWidth - 16}" height="${agentHeight - 16}" 
                fill="#ffffff" rx="6"/>
          
          <!-- Sombra interna sutil -->
          <rect x="8" y="8" width="${agentWidth - 16}" height="2" 
                fill="rgba(0,0,0,0.03)" rx="6" ry="0"/>
        </svg>`
      );
      
      // Componer: canvas base + marco + imagen (centrado en el marco)
      agentProcessed = await sharp(agentCanvas)
        .composite([
          {
            input: agentFrame,
            top: 0,
            left: 0
          },
          {
            input: agentImg,
            top: 7,
            left: 7
          }
        ])
        .png()
        .toBuffer();
    }
    
    // 4. Crear overlay de diseño premium con sistema coherente
    const designOverlay = createVIPPremiumDesignOverlay(
      width, 
      height, 
      propertyInfo, 
      contentY,      // Inicio del área de contenido (626px)
      contentHeight, // Alto del área de contenido (384px)
      footerY,       // Inicio del footer (1010px)
      footerHeight,  // Alto del footer (70px)
      agentProcessed !== null,
      agentY,        // Posición Y del agente
      agentHeight,   // Alto del agente
      interiorY,     // Posición Y de la imagen circular
      interiorCircleSize // Tamaño de la imagen circular
    );
    const designBuffer = Buffer.from(designOverlay, 'utf8');
    
    // Crear canvas blanco como base
    const baseCanvas = await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .png()
    .toBuffer();
    
    // Crear array de composiciones en orden de capas
    const composites = [];
    
    // Capa 1: Imagen exterior (parte superior)
    composites.push({
      input: exteriorProcessed,
      top: 0,
      left: 0
    });
    
    // Capa 2: Tarjeta de precio PREMIUM EDITORIAL sobre la imagen exterior
    const precioStr = (propertyInfo.precio || 'Consultar').toString();
    const precioFontSize = precioStr.length <= 4 ? 42 : precioStr.length <= 6 ? 36 : precioStr.length <= 8 ? 31 : 27;  // 25% reducción: 56->42, 48->36, 42->31, 36->27
    
    const priceCardSvg = `
      <svg width="${priceCardWidth}" height="${priceCardHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradiente blanco puro premium -->
          <linearGradient id="priceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.98" />
            <stop offset="100%" style="stop-color:#fafafa;stop-opacity:0.98" />
          </linearGradient>
          <!-- Sombra elegante y profunda -->
          <filter id="priceShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
            <feOffset dx="0" dy="8" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#priceShadow)">
          <!-- Fondo blanco premium -->
          <rect x="0" y="0" width="${priceCardWidth}" height="${priceCardHeight}" rx="12" fill="url(#priceGrad)" />
          
          <!-- Borde exterior sutil -->
          <rect x="0" y="0" width="${priceCardWidth}" height="${priceCardHeight}" rx="12" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1" />
          
          <!-- Acento dorado superior - 25% reducido -->
          <rect x="15" y="9" width="30" height="2" rx="1" fill="#d4af37" opacity="0.8" />
          
          <!-- Label "Precio" - 25% reducido -->
          <text x="15" y="28" style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 8px; font-weight: 600; fill: #888888; letter-spacing: 1px; text-transform: uppercase;">Precio</text>
          
          <!-- Moneda - 25% reducido -->
          <text x="15" y="48" style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 700; fill: #555555; letter-spacing: 0.2px;">${propertyInfo.moneda || 'USD'}</text>
          
          <!-- Precio principal - 25% reducido en posición -->
          <text x="15" y="79" style="font-family: 'Playfair Display', Georgia, serif; font-size: ${precioFontSize}px; font-weight: 800; fill: #1a1a1a; letter-spacing: -1px;">${propertyInfo.precio || 'Consultar'}</text>
        </g>
      </svg>
    `;
    const priceCardBuffer = Buffer.from(priceCardSvg, 'utf8');
    composites.push({
      input: priceCardBuffer,
      top: priceCardY,
      left: priceCardX
    });
    
    // Capa 3: Overlay de diseño (área blanca con info + footer azul)
    composites.push({
      input: designBuffer,
      top: 0,
      left: 0
    });
    
    // Capa 4: Foto del agente (sobre el área blanca)
    if (agentProcessed) {
      composites.push({
        input: agentProcessed,
        top: agentY,
        left: agentX
      });
    }
    
    // Capa 5: Imagen interior circular con borde dorado (sobre el exterior)
    composites.push({
      input: interiorWithBorder,
      top: interiorY,
      left: interiorX
    });
    
    // Capa 6: Código QR con diseño limpio y profesional
    const qrUrl = propertyInfo.url || 'https://www.rialtor.app';
    const qrSize = 165; // Tamaño óptimo
    const qrFrameSize = qrSize + 32; // Marco incluido
    const qrX = width - qrSize - 70; // Posición desde el borde derecho
    // Alinear bottom del QR con el agente y características
    const qrY = footerY - qrFrameSize - 25; // Alineado con agente
    
    try {
      // Generar código QR de alta calidad
      const qrBuffer = await QRCode.toBuffer(qrUrl, {
        width: qrSize,
        margin: 1,
        color: {
          dark: '#2a2a2a',  // Negro suave
          light: '#ffffff'  // Blanco puro
        },
        errorCorrectionLevel: 'H'
      });
      
      // Marco limpio y minimalista para el QR
      const qrFrame = Buffer.from(
        `<svg width="${qrFrameSize}" height="${qrFrameSize}">
          <defs>
            <!-- Gradiente elegante para el marco -->
            <linearGradient id="qrFrameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#3a3a3a;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#2a2a2a;stop-opacity:1" />
            </linearGradient>
            <!-- Sombra suave -->
            <filter id="qrShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
              <feOffset dx="0" dy="3" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.18"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <!-- Marco exterior -->
          <rect x="0" y="0" width="${qrFrameSize}" height="${qrFrameSize}" 
                fill="url(#qrFrameGrad)" rx="10" filter="url(#qrShadow)"/>
          
          <!-- Línea superior elegante -->
          <line x1="16" y1="5" x2="${qrFrameSize - 16}" y2="5" 
                stroke="rgba(255,255,255,0.2)" stroke-width="1.2" stroke-linecap="round"/>
          
          <!-- Fondo blanco del QR -->
          <rect x="8" y="8" width="${qrSize + 16}" height="${qrSize + 16}" 
                fill="#ffffff" rx="6"/>
          
          <!-- Borde sutil -->
          <rect x="8" y="8" width="${qrSize + 16}" height="${qrSize + 16}" 
                fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="0.8" rx="6"/>
        </svg>`
      );
      
      // Componer QR con marco
      const qrWithFrame = await sharp({
        create: {
          width: qrFrameSize,
          height: qrFrameSize,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
      })
      .composite([
        {
          input: qrFrame,
          top: 0,
          left: 0
        },
        {
          input: qrBuffer,
          top: 16,
          left: 16
        }
      ])
      .png({ quality: 95 })
      .toBuffer();
      
      // Agregar a composiciones
      composites.push({
        input: qrWithFrame,
        top: Math.round(qrY - 16),
        left: qrX - 16
      });
      
      console.log('[PLACAS VIP] Código QR generado para:', qrUrl);
    } catch (qrError) {
      console.error('[PLACAS VIP] Error generando QR:', qrError);
    }
    
    // Componer todas las capas
    const finalImage = await sharp(baseCanvas)
      .composite(composites)
      .png({ quality: 95, compressionLevel: 6 })
      .toBuffer();
    
    console.log('[PLACAS VIP] Placa VIP premium creada exitosamente');
    return finalImage;
    
  } catch (error) {
    console.error('[PLACAS VIP] Error creando placa VIP:', error);
    throw error;
  }
}

/**
 * Crear overlay de diseño PREMIUM VIP de alto nivel para placa inmobiliaria
 * Diseño editorial elegante con tipografía refinada y balance visual premium
 * @param {number} width - Ancho total
 * @param {number} height - Alto total
 * @param {object} propertyInfo - Información de la propiedad
 * @param {number} contentY - Posición Y del área de contenido
 * @param {number} contentHeight - Alto del área de contenido
 * @param {number} footerY - Posición Y del footer
 * @param {number} footerHeight - Alto del footer
 * @param {boolean} hasAgentPhoto - Si tiene foto de agente
 * @param {number} agentY - Posición Y del agente
 * @param {number} agentHeight - Alto del agente
 * @param {number} interiorY - Posición Y de la imagen circular interior
 * @param {number} interiorCircleSize - Tamaño de la imagen circular
 * @returns {string} SVG string
 */
function createVIPPremiumDesignOverlay(width, height, propertyInfo, contentY, contentHeight, footerY, footerHeight, hasAgentPhoto, agentY, agentHeight, interiorY, interiorCircleSize) {
  const esc = (s) => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Extraer datos
  const tipo = esc(propertyInfo.tipo || 'Departamento');
  const ambientes = propertyInfo.ambientes ? esc(propertyInfo.ambientes) : null;
  const dormitorios = propertyInfo.dormitorios ? esc(propertyInfo.dormitorios) : null;
  const banos = propertyInfo.banos ? esc(propertyInfo.banos) : null;
  const cocheras = propertyInfo.cocheras ? esc(propertyInfo.cocheras) : null;
  const m2_totales = propertyInfo.m2_totales ? esc(propertyInfo.m2_totales) : null;
  const m2_cubiertos = propertyInfo.m2_cubiertos ? esc(propertyInfo.m2_cubiertos) : null;
  const precio = esc(propertyInfo.precio || 'Consultar');
  const moneda = esc(propertyInfo.moneda || 'USD');
  const direccion = esc(propertyInfo.direccion || '');
  const corredores = esc(propertyInfo.corredores || '');
  const contacto = esc(propertyInfo.contacto || '');
  const url = esc(propertyInfo.url || 'www.rialtor.app');
  
  // === SISTEMA DE LAYOUT EDITORIAL PREMIUM ===
  // - Agente: 200px + márgenes amplios = área izquierda de ~290px
  // - Info central: desde 290px hasta ~750px (460px de ancho)
  // - QR: desde ~750px hasta borde derecho (~330px de área)
  
  const agentAreaWidth = hasAgentPhoto ? 290 : 0;
  const qrAreaWidth = 330; // Espacio amplio para QR centrado
  const infoStartX = hasAgentPhoto ? 290 : 60; // Más espaciado desde el agente
  const infoEndX = width - qrAreaWidth;
  const infoWidth = infoEndX - infoStartX; // ~460px para información
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      /* === TIPOGRAFÍA VIP PREMIUM === */
      /* Fuentes: Playfair Display y Inter */
      
      /* Labels superiores - con tono celeste */
      .vip-label { 
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; 
        font-size: 10px; 
        font-weight: 700; 
        fill: #7b96ad; 
        letter-spacing: 2.5px; 
        text-transform: uppercase; 
      }
      
      /* Tipo de propiedad - azul marino elegante */
      .vip-tipo { 
        font-family: 'Playfair Display', Georgia, serif; 
        font-size: 30px; 
        font-weight: 700; 
        fill: #2d4458; 
        letter-spacing: 0px;
      }
      
      /* Dirección - tono celeste oscuro */
      .vip-direccion { 
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; 
        font-size: 15px; 
        font-weight: 500; 
        fill: #5a6f82; 
        letter-spacing: 0.1px;
      }
      
      /* Valores de características - azul grisáceo */
      .vip-feature-value { 
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; 
        font-size: 24px; 
        font-weight: 700; 
        fill: #3d5166; 
      }
      
      /* Labels de características - celeste suave */
      .vip-feature-label { 
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; 
        font-size: 12px; 
        font-weight: 500; 
        fill: #8197ab; 
        letter-spacing: 0.1px;
      }
      
      /* Footer URL - azul marino */
      .vip-footer-url { 
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; 
        font-size: 20px; 
        font-weight: 700; 
        fill: #3d5166; 
        letter-spacing: 0.2px;
      }
      
      /* Footer contacto - celeste oscuro */
      .vip-footer-contact { 
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; 
        font-size: 15px; 
        font-weight: 600; 
        fill: #4a6075; 
        letter-spacing: 0.1px;
      }
      
      /* Footer info secundaria - celeste medio */
      .vip-footer-info { 
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; 
        font-size: 13px; 
        font-weight: 500; 
        fill: #6b8299; 
        letter-spacing: 0.1px;
      }
      
      /* Badge RIALTOR */
      .vip-badge { 
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; 
        font-size: 12px; 
        font-weight: 800; 
        fill: #ffffff; 
        letter-spacing: 1.8px;
      }
    </style>
    
    <!-- Iconos SVG refinados - líneas más finas y elegantes -->
    <symbol id="icon-area" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.2" rx="2"/>
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2,2"/>
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2,2"/>
    </symbol>
    
    <symbol id="icon-covered" viewBox="0 0 24 24">
      <path d="M3 21V10L12 3l9 7v11" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      <rect x="9" y="14" width="6" height="7" fill="none" stroke="currentColor" stroke-width="1.2"/>
    </symbol>
    
    <symbol id="icon-bed" viewBox="0 0 24 24">
      <path d="M2 18v-5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v5" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <path d="M2 18v2M22 18v2" stroke="currentColor" stroke-width="1.2"/>
      <ellipse cx="7" cy="8" rx="2" ry="1.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <line x1="2" y1="10" x2="2" y2="14" stroke="currentColor" stroke-width="1.2"/>
    </symbol>
    
    <symbol id="icon-bath" viewBox="0 0 24 24">
      <path d="M4 12h16v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5z" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <path d="M6 12V5a2 2 0 0 1 2-2h1" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="9" cy="5" r="1" fill="currentColor"/>
    </symbol>
    
    <symbol id="icon-garage" viewBox="0 0 24 24">
      <path d="M4 20V10l8-6 8 6v10" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <rect x="7" y="14" width="10" height="6" fill="none" stroke="currentColor" stroke-width="1.2" rx="1"/>
      <line x1="7" y1="17" x2="17" y2="17" stroke="currentColor" stroke-width="0.8"/>
    </symbol>
    
    <symbol id="icon-ambientes" viewBox="0 0 24 24">
      <path d="M3 9h2v12H3zM7 3h2v18H7zM11 6h2v15h-2zM15 4h2v17h-2zM19 8h2v13h-2z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </symbol>
    
    <!-- Gradientes editorial premium con tonos celestes/pasteles -->
    <linearGradient id="premiumContentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fbff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f0f6fa;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="footerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#e8f2f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dfe9f0;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#5b7c99;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7594b3;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#9fb8d1;stop-opacity:0.4" />
      <stop offset="50%" style="stop-color:#b8cfe5;stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:#9fb8d1;stop-opacity:0.4" />
    </linearGradient>
    
    <linearGradient id="softBlueAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#a8c5dd;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c5dae9;stop-opacity:1" />
    </linearGradient>
    
    <!-- Sombras refinadas -->
    <filter id="shadowSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="1" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.1"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="shadowMedium" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.15"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- === ÁREA DE CONTENIDO PRINCIPAL === -->
  <rect x="0" y="${contentY}" width="${width}" height="${contentHeight}" fill="url(#premiumContentGradient)" />
  
  <!-- Línea separadora celeste elegante -->
  <rect x="0" y="${contentY}" width="${width}" height="2" fill="url(#softBlueAccent)" opacity="0.6" />
  <line x1="0" y1="${contentY + 2}" x2="${width}" y2="${contentY + 2}" stroke="#d0dce6" stroke-width="1" />
  
  <!-- === SECCIÓN DE INFORMACIÓN DE PROPIEDAD === -->\n`;
  
  // Posicionamiento vertical optimizado
  let currentY = contentY + 38;
  
  // LABEL: "Propiedad"
  svg += `  <text x="${infoStartX}" y="${currentY}" class="vip-label">PROPIEDAD</text>\n`;
  currentY += 32;
  
  // TIPO de propiedad y DIRECCIÓN en la misma línea
  svg += `  <text x="${infoStartX}" y="${currentY}" class="vip-tipo">${tipo}</text>\n`;
  
  if (direccion) {
    // Calcular ancho aproximado del tipo (Playfair Display 30px, bold, serif)
    // Usar cálculo muy generoso para evitar superposición
    const tipoWidth = tipo.length * 21; // Ajustado a 21px por carácter
    const separatorX = infoStartX + tipoWidth + 30; // Margen de 30px
    
    // Separador vertical entre tipo y dirección
    svg += `  <line x1="${separatorX}" y1="${currentY - 20}" x2="${separatorX}" y2="${currentY + 2}" stroke="#c5dae9" stroke-width="2" stroke-linecap="round" opacity="0.6" />\n`;
    
    // Dirección a la derecha del separador
    svg += `  <text x="${separatorX + 30}" y="${currentY}" class="vip-direccion">${direccion}</text>\n`;
  }
  
  currentY += 28;
  
  // Separador minimalista celeste
  svg += `  <line x1="${infoStartX}" y1="${currentY}" x2="${infoStartX + 80}" y2="${currentY}" stroke="#a8c5dd" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />\n`;
  currentY += 32;
  
  // === CARACTERÍSTICAS - Grid 2x2 con ambientes, cochera, dormitorios, baños, etc. ===
  const ambientesCard = ambientes ? { icon: 'icon-ambientes', value: ambientes, unit: '', label: ambientes === '1' ? 'ambiente' : 'ambientes' } : null;
  const cocheraCard = cocheras ? { icon: 'icon-garage', value: cocheras, unit: '', label: cocheras === '1' ? 'cochera' : 'cocheras' } : null;
  
  const features = [];
  // Construir el array de features en orden: ambientes, cochera, m2_totales, m2_cubiertos, dormitorios, baños
  if (ambientesCard) features.push(ambientesCard);
  if (cocheraCard) features.push(cocheraCard);
  if (m2_totales) features.push({ icon: 'icon-area', value: `${m2_totales}`, unit: 'm²', label: 'totales' });
  if (m2_cubiertos) features.push({ icon: 'icon-covered', value: `${m2_cubiertos}`, unit: 'm²', label: 'cubiertos' });
  if (dormitorios) features.push({ icon: 'icon-bed', value: dormitorios, unit: '', label: dormitorios === '1' ? 'dormitorio' : 'dormitorios' });
  if (banos) features.push({ icon: 'icon-bath', value: banos, unit: '', label: banos === '1' ? 'baño' : 'baños' });
  
  // Calcular posiciones de columnas para características
  // Ajustar para que las tarjetas ocupen el mismo alto que el agente (265px)
  const iconSize = 26;
  const featureColWidth = Math.min(210, (infoWidth - 25) / 2);
  
  // Calcular altura disponible desde currentY hasta footerY - 25px (donde termina el agente)
  const availableHeight = (footerY - 25) - currentY;
  // Si tenemos features en 2 columnas, calcular spacing para distribuir uniformemente
  const numRows = Math.ceil(features.length / 2);
  const featureRowHeight = numRows > 0 ? (availableHeight - 52) / numRows : 60; // 52px es la altura de cada card
  
  const col1X = infoStartX;
  const col2X = infoStartX + featureColWidth + 25;
  
  if (features.length > 0) {
    svg += `\n  <!-- Grid de características (ambientes, cochera, metros, dormitorios, baños) -->\n`;
    
    features.forEach((feature, index) => {
      if (index >= 6) return; // Máximo 6 características
      
      const col = index % 2;
      const row = Math.floor(index / 2);
      const featureX = col === 0 ? col1X : col2X;
      const featureY = currentY + (row * featureRowHeight);
      
      // Verificar límites
      if (featureY + 45 > footerY - 18) return;
      
      // Contenedor con tono celeste suave
      svg += `  <rect x="${featureX - 5}" y="${featureY - 5}" width="${featureColWidth - 12}" height="52" rx="10" fill="#f5f9fc" opacity="0.8" />\n`;
      svg += `  <rect x="${featureX - 5}" y="${featureY - 5}" width="${featureColWidth - 12}" height="52" rx="10" fill="none" stroke="#c5dae9" stroke-width="0.8" />\n`;
      
      svg += `  <g style="color: #6b8299">\n`;
      svg += `    <svg x="${featureX}" y="${featureY}" width="${iconSize}" height="${iconSize}">\n`;
      svg += `      <use href="#${feature.icon}" />\n`;
      svg += `    </svg>\n`;
      svg += `    <text x="${featureX + iconSize + 10}" y="${featureY + 18}" class="vip-feature-value">${feature.value}<tspan style="font-size: 15px; font-weight: 500; fill: #8197ab;"> ${feature.unit}</tspan></text>\n`;
      svg += `    <text x="${featureX + iconSize + 10}" y="${featureY + 36}" class="vip-feature-label">${feature.label}</text>\n`;
      svg += `  </g>\n`;
    });
  }
  
  // === FOOTER EDITORIAL PREMIUM ===
  svg += `\n  <!-- Footer Editorial Premium -->\n`;
  
  // Separador superior elegante con celeste
  svg += `  <rect x="0" y="${footerY}" width="${width}" height="2" fill="url(#softBlueAccent)" opacity="0.7" />\n`;
  svg += `  <line x1="60" y1="${footerY + 2}" x2="${width - 60}" y2="${footerY + 2}" stroke="#c5dae9" stroke-width="1" />\n`;
  
  // Fondo del footer limpio
  svg += `  <rect x="0" y="${footerY + 3}" width="${width}" height="${footerHeight - 3}" fill="url(#footerGradient)" />\n`;
  
  const footerCenterY = footerY + 60;
  const centerX = width / 2;
  
  // Badge RIALTOR premium a la izquierda - más compacto
  svg += `  <g filter="url(#shadowMedium)">\n`;
  svg += `    <rect x="50" y="${footerY + 22}" width="130" height="40" rx="20" fill="url(#accentGradient)" />\n`;
  svg += `    <rect x="50" y="${footerY + 22}" width="130" height="40" rx="20" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />\n`;
  svg += `    <line x1="65" y1="${footerY + 26}" x2="165" y2="${footerY + 26}" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-linecap="round" />\n`;
  svg += `    <text x="115" y="${footerY + 48}" text-anchor="middle" class="vip-badge">RIALTOR</text>\n`;
  svg += `  </g>\n`;
  
  // Sección central - información de contacto en dos líneas (más compacto)
  const lineHeight = 22;
  let currentLineY = footerY + 32;
  
  // URL principal - primera línea
  svg += `  <text x="${centerX}" y="${currentLineY}" text-anchor="middle" class="vip-footer-url">${url}</text>\n`;
  currentLineY += lineHeight;
  
  // Corredor - segunda línea
  if (corredores) {
    svg += `  <text x="${centerX}" y="${currentLineY}" text-anchor="middle" class="vip-footer-contact">${corredores}</text>\n`;
    currentLineY += lineHeight;
  }
  
  // Contacto - tercera línea
  if (contacto) {
    svg += `  <text x="${centerX}" y="${currentLineY}" text-anchor="middle" class="vip-footer-info">${contacto}</text>\n`;
  }
  
  svg += `</svg>`;
  
  return svg;
}

/**
 * Crear overlay de diseño completo para placa VIP según imagen de referencia - DEPRECATED
 * @param {number} width - Ancho total
 * @param {number} height - Alto total
 * @param {object} propertyInfo - Información de la propiedad
 * @param {number} exteriorHeight - Alto de la imagen exterior
 * @param {number} barY - Posición Y de la barra azul
 * @param {number} barHeight - Alto de la barra azul
 * @param {boolean} hasAgentPhoto - Si tiene foto de agente
 * @returns {string} SVG string
 */
function createVIPReferenceDesignOverlay(width, height, propertyInfo, exteriorHeight, barY, barHeight, hasAgentPhoto) {
  const esc = (s) => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Extraer datos
  const tipo = esc(propertyInfo.tipo || 'Propiedad');
  const ambientes = propertyInfo.ambientes ? esc(propertyInfo.ambientes) : null;
  const m2 = propertyInfo.m2_totales ? esc(propertyInfo.m2_totales) : null;
  const precio = esc(propertyInfo.precio || 'Consultar');
  const moneda = esc(propertyInfo.moneda || 'USD');
  const direccion = esc(propertyInfo.direccion || '');
  const corredores = esc(propertyInfo.corredores || '');
  const contacto = esc(propertyInfo.contacto || '');
  
  // Área blanca inferior (entre exterior y barra azul)
  const whiteAreaY = exteriorHeight;
  const whiteAreaHeight = barY - exteriorHeight;
  
  // Posición de textos en área blanca (lado derecho, después del agente)
  const textStartX = hasAgentPhoto ? 280 : 60;
  const textStartY = whiteAreaY + 40;
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .ref-tipo { font-family: 'Arial', sans-serif; font-size: 24px; font-weight: 700; fill: #333333; }
      .ref-ambientes { font-family: 'Arial', sans-serif; font-size: 32px; font-weight: 700; fill: #1a1a1a; }
      .ref-precio { font-family: 'Arial', sans-serif; font-size: 28px; font-weight: 700; fill: #1a1a1a; }
      .ref-bar-text { font-family: 'Arial', sans-serif; font-size: 16px; font-weight: 600; fill: #ffffff; }
      .ref-bar-bold { font-family: 'Arial', sans-serif; font-size: 18px; font-weight: 700; fill: #ffffff; }
    </style>
  </defs>
  
  <!-- Área blanca inferior -->
  <rect x="0" y="${whiteAreaY}" width="${width}" height="${whiteAreaHeight}" fill="#ffffff" />
  
  <!-- Textos en área blanca -->
  <text x="${textStartX}" y="${textStartY}" class="ref-ambientes">${ambientes || ''} ambientes</text>
  <text x="${textStartX}" y="${textStartY + 40}" class="ref-tipo">${m2 ? m2 + ' m2' : ''}</text>
  <text x="${textStartX}" y="${textStartY + 75}" class="ref-precio">${moneda} ${precio}</text>
  
  <!-- Barra azul inferior -->
  <rect x="0" y="${barY}" width="${width}" height="${barHeight}" fill="#4169B0" />
  
  <!-- URL/Website en barra azul (centrado superior) -->
  <text x="${width/2}" y="${barY + 30}" text-anchor="middle" class="ref-bar-bold">www.rialtor.app</text>
`;
  
  // Información de contacto en la barra (línea inferior)
  let bottomTextY = barY + 70;
  let leftInfo = [];
  let rightInfo = [];
  
  if (corredores) {
    leftInfo.push(corredores);
  }
  if (direccion) {
    leftInfo.push(direccion);
  }
  if (contacto) {
    rightInfo.push(contacto);
  }
  
  const leftText = leftInfo.join(' | ');
  const rightText = rightInfo.join(' | ');
  
  if (leftText) {
    svg += `  <text x="50" y="${bottomTextY}" class="ref-bar-text">${leftText}</text>\n`;
  }
  
  if (rightText) {
    svg += `  <text x="${width - 50}" y="${bottomTextY}" text-anchor="end" class="ref-bar-text">${rightText}</text>\n`;
  }
  
  svg += `</svg>`;
  
  return svg;
}

/**
 * Crear overlay de texto para usar CON EL TEMPLATE - DEPRECATED
 * El template tiene 4 áreas: interior (30,30), exterior (545,30), agente (30,545), info (330,545)
 */
function createVIPTextOverlayForTemplate(width, height, propertyInfo) {
  const esc = (s) => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Extraer datos
  const precio = esc(propertyInfo.precio || 'Consultar');
  const moneda = esc(propertyInfo.moneda || 'USD');
  const tipo = esc(propertyInfo.tipo || 'Propiedad');
  const ambientes = propertyInfo.ambientes ? esc(propertyInfo.ambientes) : null;
  const dormitorios = propertyInfo.dormitorios ? esc(propertyInfo.dormitorios) : null;
  const banos = propertyInfo.banos ? esc(propertyInfo.banos) : null;
  const cocheras = propertyInfo.cocheras ? esc(propertyInfo.cocheras) : null;
  const m2_totales = propertyInfo.m2_totales ? esc(propertyInfo.m2_totales) : null;
  const m2_cubiertos = propertyInfo.m2_cubiertos ? esc(propertyInfo.m2_cubiertos) : null;
  const direccion = esc(propertyInfo.direccion || '');
  const corredores = esc(propertyInfo.corredores || '');
  const contacto = esc(propertyInfo.contacto || '');
  const email = esc(propertyInfo.email || '');
  
  // Área de información (derecha inferior del template, después de la foto del agente)
  // Agente ocupa: x:30, y:545, width:280, height:350
  // Entonces el área de info comienza en x:330 y tiene hasta 1050 de ancho
  const infoAreaX = 350;  // Dejamos margen después del agente
  const infoAreaY = 580;  // Comenzamos un poco más abajo
  const infoAreaWidth = 700;  // Hasta el borde derecho con margen
  
  let svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<svg width=\"${width}\" height=\"${height}\" xmlns=\"http://www.w3.org/2000/svg\">
  <defs>
    <style>
      .vip-price { font-family: 'Arial Black', sans-serif; font-size: 56px; font-weight: 900; fill: #1a365d; }
      .vip-currency { font-family: 'Arial', sans-serif; font-size: 36px; font-weight: 700; fill: #2c5282; }
      .vip-type { font-family: 'Arial', sans-serif; font-size: 28px; font-weight: 700; fill: #2d3748; }
      .vip-info { font-family: 'Arial', sans-serif; font-size: 22px; font-weight: 600; fill: #374151; }
      .vip-footer { font-family: 'Arial', sans-serif; font-size: 16px; font-weight: 500; fill: #4a5568; }
    </style>
  </defs>
  
  <!-- Moneda y precio destacado -->
  <text x=\"${infoAreaX}\" y=\"${infoAreaY}\" class=\"vip-currency\">${moneda}</text>
  <text x=\"${infoAreaX}\" y=\"${infoAreaY + 55}\" class=\"vip-price\">${precio}</text>
  
  <!-- Tipo de propiedad -->
  <text x=\"${infoAreaX}\" y=\"${infoAreaY + 95}\" class=\"vip-type\">${tipo}</text>
`;
  
  let currentY = infoAreaY + 135;
  const lineHeight = 30;
  
  // Características principales (columna 1)
  const col1X = infoAreaX;
  const col2X = infoAreaX + 350;
  
  let col1Y = currentY;
  let col2Y = currentY;
  let useCol1 = true;
  
  const features = [];
  if (ambientes) features.push(`${ambientes} amb.`);
  if (dormitorios) features.push(`${dormitorios} dorm.`);
  if (banos) features.push(`${banos} baños`);
  if (cocheras) features.push(`${cocheras} coch.`);
  if (m2_totales) features.push(`${m2_totales} m² tot.`);
  if (m2_cubiertos) features.push(`${m2_cubiertos} m² cub.`);
  
  features.forEach(feature => {
    if (useCol1) {
      svg += `  <text x=\"${col1X}\" y=\"${col1Y}\" class=\"vip-info\">• ${feature}</text>\n`;
      col1Y += lineHeight;
      useCol1 = false;
    } else {
      svg += `  <text x=\"${col2X}\" y=\"${col2Y}\" class=\"vip-info\">• ${feature}</text>\n`;
      col2Y += lineHeight;
      useCol1 = true;
    }
  });
  
  // Footer con información de contacto (área inferior del template)
  const footerY = 950;
  const footerLineHeight = 22;
  
  svg += `\n  <!-- Footer con contacto -->\n`;
  
  let footerCurrentY = footerY;
  
  if (direccion) {
    svg += `  <text x=\"${infoAreaX}\" y=\"${footerCurrentY}\" class=\"vip-footer\">📍 ${direccion}</text>\n`;
    footerCurrentY += footerLineHeight;
  }
  
  if (contacto) {
    svg += `  <text x=\"${infoAreaX}\" y=\"${footerCurrentY}\" class=\"vip-footer\">📞 ${contacto}</text>\n`;
    footerCurrentY += footerLineHeight;
  }
  
  if (email) {
    svg += `  <text x=\"${infoAreaX}\" y=\"${footerCurrentY}\" class=\"vip-footer\">✉️ ${email}</text>\n`;
    footerCurrentY += footerLineHeight;
  }
  
  if (corredores) {
    svg += `  <text x=\"${infoAreaX}\" y=\"${footerCurrentY}\" class=\"vip-footer\">👤 ${corredores}</text>\n`;
  }
  
  svg += `</svg>`;
  
  return svg;
}

/**
 * Crear overlay de diseño completo para la placa VIP (estilo referencia) - DEPRECATED
 */
function createVIPDesignOverlay(width, height, propertyInfo, hasAgentPhoto) {
  const esc = (s) => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Extraer datos
  const precio = esc(propertyInfo.precio || 'Consultar');
  const moneda = esc(propertyInfo.moneda || 'USD');
  const ambientes = propertyInfo.ambientes ? esc(propertyInfo.ambientes) : null;
  const m2_totales = propertyInfo.m2_totales ? esc(propertyInfo.m2_totales) : null;
  const direccion = esc(propertyInfo.direccion || '');
  const corredores = esc(propertyInfo.corredores || '');
  const contacto = esc(propertyInfo.contacto || '');
  
  // Barra inferior azul con información
  const barraHeight = 200;
  const barraY = height - barraHeight;
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .vip-title { font-family: 'Arial', sans-serif; font-size: 24px; font-weight: 700; fill: #ffffff; }
      .vip-price { font-family: 'Arial Black', sans-serif; font-size: 42px; font-weight: 900; fill: #ffffff; }
      .vip-info { font-family: 'Arial', sans-serif; font-size: 20px; font-weight: 600; fill: #ffffff; }
      .vip-footer { font-family: 'Arial', sans-serif; font-size: 16px; font-weight: 500; fill: #ffffff; }
      .vip-agent-label { font-family: 'Arial', sans-serif; font-size: 18px; font-weight: 700; fill: #333333; }
    </style>
  </defs>
  
  <!-- Barra inferior azul semitransparente -->
  <rect x="0" y="${barraY}" width="${width}" height="${barraHeight}" fill="rgba(70, 130, 180, 0.92)" />
  
  <!-- Área del agente con fondo blanco si hay foto -->
  ${hasAgentPhoto ? `<rect x="20" y="${barraY - 360}" width="300" height="370" fill="rgba(255,255,255,0.95)" rx="10" />` : ''}
  ${hasAgentPhoto ? `<text x="170" y="${barraY - 320}" text-anchor="middle" class="vip-agent-label">Agente</text>` : ''}
  
  <!-- Precio destacado en la barra -->
  <text x="400" y="${barraY + 70}" class="vip-price">${moneda} ${precio}</text>
  
  <!-- Información de la propiedad -->`;
  
  let infoY = barraY + 115;
  
  if (ambientes) {
    svg += `\n  <text x="400" y="${infoY}" class="vip-info">🏠 ${ambientes} ambientes</text>`;
    infoY += 30;
  }
  
  if (m2_totales) {
    svg += `\n  <text x="400" y="${infoY}" class="vip-info">📐 ${m2_totales} m²</text>`;
    infoY += 30;
  }
  
  if (direccion) {
    svg += `\n  <text x="400" y="${infoY}" class="vip-info">📍 ${direccion}</text>`;
  }
  
  // Footer con información de contacto y corredores
  svg += `\n  <!-- Footer -->
  <rect x="0" y="${height - 50}" width="${width}" height="50" fill="rgba(60, 100, 140, 0.95)" />`;
  
  if (contacto) {
    svg += `\n  <text x="40" y="${height - 22}" class="vip-footer">📞 ${contacto}</text>`;
  }
  
  if (corredores) {
    const corrX = contacto ? 500 : 40;
    svg += `\n  <text x="${corrX}" y="${height - 22}" class="vip-footer">${corredores}</text>`;
  }
  
  svg += `\n</svg>`;
  
  return svg;
}

/**
 * Crear overlay de texto para la placa VIP (DEPRECATED - usar createVIPDesignOverlay)
 */
function createVIPTextOverlay(width, height, propertyInfo) {
  // Helper para escapar texto en SVG
  const esc = (s) => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // Extraer datos de la propiedad
  const precio = esc(propertyInfo.precio || 'Consultar');
  const moneda = esc(propertyInfo.moneda || 'USD');
  const tipo = esc(propertyInfo.tipo || 'Propiedad');
  const direccion = esc(propertyInfo.direccion || '');
  const ambientes = propertyInfo.ambientes ? esc(propertyInfo.ambientes) : null;
  const dormitorios = propertyInfo.dormitorios ? esc(propertyInfo.dormitorios) : null;
  const banos = propertyInfo.banos ? esc(propertyInfo.banos) : null;
  const cocheras = propertyInfo.cocheras ? esc(propertyInfo.cocheras) : null;
  const m2_totales = propertyInfo.m2_totales ? esc(propertyInfo.m2_totales) : null;
  const m2_cubiertos = propertyInfo.m2_cubiertos ? esc(propertyInfo.m2_cubiertos) : null;
  const contacto = esc(propertyInfo.contacto || '');
  const email = propertyInfo.email ? esc(propertyInfo.email) : null;
  const corredores = esc(propertyInfo.corredores || '');
  const agentName = esc(propertyInfo.agentName || 'Agente');
  const agency = esc(propertyInfo.agency || '');
  
  // Tamaños de fuente adaptativos
  const titleSize = Math.max(32, Math.floor(width / 25));
  const priceSize = Math.max(48, Math.floor(width / 15));
  const infoSize = Math.max(20, Math.floor(width / 40));
  const contactSize = Math.max(18, Math.floor(width / 45));
  
  // Área de texto inferior (debajo de las imágenes del agente)
  const textAreaY = Math.floor(height * 0.58);
  const textAreaX = Math.floor(width * 0.28);
  const textAreaWidth = Math.floor(width * 0.67);
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .vip-title { font-family: 'Arial', sans-serif; font-size: ${titleSize}px; font-weight: 700; fill: #1a202c; }
      .vip-price { font-family: 'Arial Black', sans-serif; font-size: ${priceSize}px; font-weight: 900; fill: #2c5282; }
      .vip-info { font-family: 'Arial', sans-serif; font-size: ${infoSize}px; font-weight: 600; fill: #2d3748; }
      .vip-contact { font-family: 'Arial', sans-serif; font-size: ${contactSize}px; font-weight: 500; fill: #4a5568; }
      .vip-agent { font-family: 'Arial', sans-serif; font-size: ${infoSize}px; font-weight: 700; fill: #1a202c; }
    </style>
  </defs>
  
  <!-- Precio destacado -->
  <text x="${textAreaX}" y="${textAreaY}" class="vip-price">${moneda} ${precio}</text>
  
  <!-- Tipo de propiedad -->
  <text x="${textAreaX}" y="${textAreaY + priceSize + 15}" class="vip-title">${tipo}</text>
`;
  
  let currentY = textAreaY + priceSize + titleSize + 25;
  const lineHeight = infoSize + 8;
  
  // Características de la propiedad
  if (direccion) {
    svg += `  <text x="${textAreaX}" y="${currentY}" class="vip-info">📍 ${direccion}</text>\n`;
    currentY += lineHeight;
  }
  
  if (ambientes) {
    svg += `  <text x="${textAreaX}" y="${currentY}" class="vip-info">🏠 ${ambientes} ambientes</text>\n`;
    currentY += lineHeight;
  }
  
  if (dormitorios) {
    svg += `  <text x="${textAreaX}" y="${currentY}" class="vip-info">🛏️ ${dormitorios} dormitorios</text>\n`;
    currentY += lineHeight;
  }
  
  if (banos) {
    svg += `  <text x="${textAreaX}" y="${currentY}" class="vip-info">🚿 ${banos} baños</text>\n`;
    currentY += lineHeight;
  }
  
  if (cocheras) {
    svg += `  <text x="${textAreaX}" y="${currentY}" class="vip-info">🚗 ${cocheras} cocheras</text>\n`;
    currentY += lineHeight;
  }
  
  if (m2_totales) {
    svg += `  <text x="${textAreaX}" y="${currentY}" class="vip-info">📐 ${m2_totales} m² totales</text>\n`;
    currentY += lineHeight;
  }
  
  if (m2_cubiertos) {
    svg += `  <text x="${textAreaX}" y="${currentY}" class="vip-info">📐 ${m2_cubiertos} m² cubiertos</text>\n`;
    currentY += lineHeight;
  }
  
  // Contacto
  currentY += 15;
  if (contacto) {
    svg += `  <text x="${textAreaX}" y="${currentY}" class="vip-contact">📞 ${contacto}</text>\n`;
    currentY += lineHeight;
  }
  
  if (email) {
    svg += `  <text x="${textAreaX}" y="${currentY}" class="vip-contact">✉️ ${email}</text>\n`;
    currentY += lineHeight;
  }
  
  // Corredores al final
  if (corredores) {
    currentY += 10;
    svg += `  <text x="${textAreaX}" y="${currentY}" class="vip-info">${corredores}</text>\n`;
  }
  
  // Información del agente (al lado de su foto)
  const agentTextX = Math.floor(width * 0.05);
  const agentTextY = Math.floor(height * 0.88);
  
  if (agentName) {
    svg += `  <text x="${agentTextX}" y="${agentTextY}" class="vip-agent">${agentName}</text>\n`;
  }
  
  if (agency) {
    svg += `  <text x="${agentTextX}" y="${agentTextY + infoSize + 5}" class="vip-contact">${agency}</text>\n`;
  }
  
  svg += `</svg>`;
  
  return svg;
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
function uploadBufferToCloudinary(buffer, folder, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
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

    // Eliminar imágenes de Cloudinary y la carpeta completa
    try {
      const originalImages = JSON.parse(plaque.originalImages);
      const generatedImages = JSON.parse(plaque.generatedImages);

      // Eliminar archivos individuales
      for (const imageUrl of [...originalImages, ...generatedImages]) {
        const publicId = extractPublicIdFromUrl(imageUrl);
        if (publicId) {
          console.log(`[PLACAS DELETE] Eliminando imagen: ${publicId}`);
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Eliminar la carpeta completa de originales (placas/originales/{plaqueId})
      const folderPath = `placas/originales/${id}`;
      console.log(`[PLACAS DELETE] Eliminando carpeta: ${folderPath}`);
      
      // Cloudinary requiere eliminar todos los recursos de la carpeta primero
      // Listar todos los recursos en la carpeta
      try {
        const resources = await cloudinary.api.resources({
          type: 'upload',
          prefix: folderPath,
          max_results: 500
        });

        // Eliminar cada recurso
        for (const resource of resources.resources) {
          await cloudinary.uploader.destroy(resource.public_id);
        }

        // Eliminar la carpeta vacía
        await cloudinary.api.delete_folder(folderPath);
        console.log(`[PLACAS DELETE] Carpeta eliminada exitosamente: ${folderPath}`);
      } catch (folderError) {
        console.error('[PLACAS DELETE] Error eliminando carpeta:', folderError.message);
        // No fallar la operación si la carpeta no existe o ya fue eliminada
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
    // Ejemplo URL: https://res.cloudinary.com/cloud/image/upload/v12345/placas/generadas/image.png
    // public_id: placas/generadas/image
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|gif|webp)$/);
    if (match && match[1]) {
      return match[1]; // Retorna la ruta completa sin extensión
    }
    return null;
  } catch (error) {
    console.error('[PLACAS] Error extrayendo public_id:', error);
    return null;
  }
}

module.exports = {
  upload: uploadFields, // Middleware actualizado para múltiples campos
  createPropertyPlaque,
  getUserPlaques,
  getPlaqueById,
  deletePlaque
};

// Export helper for testing
module.exports.createPlaqueSvgString = typeof createPlaqueSvgString !== 'undefined' ? createPlaqueSvgString : null;
