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

    // Limitar número máximo de imágenes a 2
    if (req.files.length > 2) {
      return res.status(400).json({
        error: 'Límite de imágenes excedido',
        message: 'Solo se permiten hasta 2 imágenes por placa'
      });
    }

    // Validar datos de la propiedad
    const propertyInfo = JSON.parse(propertyData);
    if (!propertyInfo.precio || !propertyInfo.corredores) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Faltan datos obligatorios de la propiedad (precio, corredores)'
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
        // Preparar análisis mínimo por defecto. Si se integra OpenAI aquí, reemplazar.
        const imageAnalysis = {
          ubicacion_texto: null,
          colores: null,
          tipo: null
        };

        // Generar overlay y procesar la imagen (createPlaqueOverlay descarga la imagen y compone el SVG)
        console.log('[PLACAS] Generando overlay...');
        const plaqueImageBuffer = await createPlaqueOverlay(originalUrl, propertyInfo, imageAnalysis);
        console.log('[PLACAS] Overlay generado, tamaño del buffer:', plaqueImageBuffer.length);

        // Subir imagen final a Cloudinary
        console.log('[PLACAS] Subiendo placa final a Cloudinary...');
        const folder = 'placas/generadas';
        const filename = `${Date.now()}_placa`;
        const result = await uploadBufferToCloudinary(plaqueImageBuffer, folder, filename);
        generatedImageUrls.push(result.secure_url);
        console.log('[PLACAS] Placa final subida a:', result.secure_url);

      } catch (err) {
        console.error(`[PLACAS] Error generando placa para imagen ${i + 1}:`, err && err.message ? err.message : err);
        // Continuar con la siguiente imagen (no interrumpir todo el proceso)
      }
    }

    console.log('[PLACAS] Total de placas generadas:', generatedImageUrls.length);

    // Actualizar el registro con las imágenes generadas y marcar como DONE
    await prisma.propertyPlaque.update({
      where: { id: plaqueId },
      data: {
        generatedImages: JSON.stringify(generatedImageUrls),
        status: 'COMPLETED'
      }
    });

    console.log('[PLACAS] Procesamiento completado. Placas generadas:', generatedImageUrls.length);
    return generatedImageUrls;

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
  console.log('[PLACAS] Starting createPlaqueOverlay for URL:', imageUrl);
  console.log('[PLACAS] Property info:', JSON.stringify(propertyInfo, null, 2));

  try {
    console.log('[PLACAS] Descargando imagen de:', imageUrl);

    // Descargar imagen original con reintentos para evitar fallos intermitentes (ECONNRESET)
    async function fetchWithRetry(url, attempts = 3, backoff = 500, timeoutMs = 10000) {
      for (let i = 0; i < attempts; i++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
          console.log(`[PLACAS] Fetch attempt ${i + 1} for ${url}`);
          const resp = await fetch(url, { signal: controller.signal });
          clearTimeout(id);
          if (!resp.ok) throw new Error(`Error descargando imagen: ${resp.status} ${resp.statusText}`);
          console.log(`[PLACAS] Fetch successful, status: ${resp.status}`);
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
    console.log('[PLACAS] Creando instancia de Sharp');
    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata();

    console.log('[PLACAS] Dimensiones de imagen:', width, 'x', height);

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
    console.log('[PLACAS] Generando SVG overlay');
    const svgOverlay = createPlaqueSvgString(width, height, propertyInfo, imageAnalysis);
    console.log('[PLACAS] SVG generado (long):', svgOverlay.substring(0, 200) + '...');

    // Aplicar overlay a la imagen con configuración explícita de codificación
    console.log('[PLACAS] Creando buffer SVG');
    const svgBuffer = Buffer.from(svgOverlay, 'utf8');

    console.log('[PLACAS] Tamaño del SVG buffer:', svgBuffer.length, 'bytes');

    console.log('[PLACAS] Aplicando composite con Sharp');
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

    console.log('[PLACAS] Subiendo imagen procesada a Cloudinary');
    const uploadResult = await uploadBufferToCloudinary(processedImage, 'rialtor-plaques', `plaque-${Date.now()}`);
    console.log('[PLACAS] Imagen subida exitosamente a Cloudinary:', uploadResult.secure_url);

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
function createPlaqueSvgString(width, height, propertyInfo, imageAnalysis) {
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

    // Descripción adicional para renderizar abajo-derecha (si existe)
    const descripcion = propertyInfo.descripcion || propertyInfo.descripcion_adicional || null;
    const overlayColor = determineOverlayColor(imageAnalysis && imageAnalysis.colores);
    const textColor = overlayColor === 'rgba(0,0,0,0.8)' ? '#FFFFFF' : '#000000';
    // Main box style (top-right): translucent white bg + black text
    const mainBoxFill = 'rgba(255,255,255,0.65)';
    const mainTextColor = '#000000';

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
    const precioSize = Math.max(28, Math.floor(width / 25));
    const infoSize = Math.max(18, Math.floor(width / 40));
    const contactoSize = Math.max(16, Math.floor(width / 50));
    const labelSize = Math.max(14, Math.floor(width / 60));
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
    let maxLineWidth = 0;
    for (const ln of lines) {
      if (ln.cls === 'precio') continue;
      const textWidth = ln.text.length * (ln.size * 0.6) + (ln.icon ? 22 : 0) + 40;
      if (textWidth > maxLineWidth) maxLineWidth = textWidth;
    }

    // Corredores will be rendered in a separate box bottom-left
    const corredoresText = corredores || null;

    // Crear dos boxes: uno para precio (arriba derecha) y otro para info (abajo)
    const margin = 20;
    const padding = 18;
    const lineHeight = Math.max(24, Math.floor(width / 60)); // Aumentado de 18 a 24 y divisor de 75 a 60 para más espacio

    // Calcular tamaño dinámico del box de precio basado en el contenido
    const precioText = `${moneda} ${formatPrice(precio)}`;
    const precioTextWidth = precioText.length * Math.floor(precioSize * 0.6);
    const precioBoxWidth = Math.max(200, Math.min(precioTextWidth + padding * 2, Math.floor(width * 0.35)));
    const precioBoxHeight = Math.max(80, Math.floor(height * 0.10));
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

    const infoBoxWidth = Math.max(350, maxLineWidth);
    const infoBoxHeight = Math.max(100, Math.min(infoLineCount * (lineHeight + 12) + padding * 2, Math.floor(height * 0.4)));
    const infoBoxX = width - infoBoxWidth - margin;
    const infoBoxY = precioBoxY + precioBoxHeight + 10;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xml:lang="es">\n`;
    svg += `  <defs>\n`;
    svg += `    <linearGradient id="g1" x1="0%" y1="0%" x2="0%" y2="100%">\n`;
    svg += `      <stop offset="0%" stop-color="rgba(0,0,0,0.6)" />\n`;
    svg += `      <stop offset="100%" stop-color="rgba(0,0,0,0.4)" />\n`;
    svg += `    </linearGradient>\n`;
    svg += `    <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">\n`;
    svg += `      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.45" />\n`;
    svg += `    </filter>\n`;
    svg += `    <style><![CDATA[\n`;
    svg += `      .precio { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${precioSize}px; font-weight: 700; fill: ${mainTextColor}; }\n`;
    svg += `      .info { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${infoSize}px; fill: ${mainTextColor}; font-weight: 600; }\n`;
    svg += `      .contacto { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${contactoSize}px; fill: ${mainTextColor}; font-weight: 500; }\n`;
    svg += `      .label { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${labelSize}px; fill: ${mainTextColor}; opacity: 0.9; font-weight: 600; }\n`;
    svg += `    ]]></style>\n`;
    svg += `  </defs>\n`;

    svg += `  <g filter="url(#f1)">\n`;
    // Box para precio (arriba derecha) - color personalizado #76685d
    svg += `    <rect x="${precioBoxX}" y="${precioBoxY}" width="${precioBoxWidth}" height="${precioBoxHeight}" rx="14" fill="#76685d" opacity="1" stroke="rgba(0,0,0,0.1)" stroke-width="1" />\n`;
    // Box para información (abajo)
    svg += `    <rect x="${infoBoxX}" y="${infoBoxY}" width="${infoBoxWidth}" height="${infoBoxHeight}" rx="14" fill="${mainBoxFill}" opacity="1" stroke="rgba(0,0,0,0.1)" stroke-width="1" />\n`;
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

    // Texto del precio centrado en blanco con mejor tipografía
    svg += `  <text x="${precioCenterX}" y="${precioCenterY + precioSize * 0.35}" text-anchor="middle" filter="url(#precioShadow)" style="font-family: 'DejaVu Sans', 'Arial Black', sans-serif; font-size: ${precioSize}px; font-weight: 900; fill: #FFFFFF;">${escapeForSvg(precioText)}</text>\n`;

    // Dibujar información en su box (ahora con wrapping y cálculo de alto dinámico)
    const infoX = infoBoxX + 20;
    // Filtrar líneas que no son precio
    const infoLines = lines.filter(ln => ln.cls !== 'precio');

    // Calcular ancho útil para texto dentro del box (restar padding y espacio para icono)
    const maxInfoWidthCap = Math.floor(width * 0.55);
    const effectiveInfoBoxWidth = Math.max(350, Math.min(maxLineWidth, maxInfoWidthCap));
    const maxTextWidth = Math.max(80, effectiveInfoBoxWidth - padding * 2 - 28);

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
    const computedInfoBoxHeight = Math.max(80, renderedLinesCount * (lineHeight + 8) + padding * 2);
    const maxAllowedHeight = Math.max(Math.floor(height * 0.75), computedInfoBoxHeight);
    const infoBoxHeightFinal = Math.min(computedInfoBoxHeight, height - precioBoxHeight - margin - 10);
    // Use final effective width as earlier computed
    const finalInfoBoxWidth = effectiveInfoBoxWidth;
    const finalInfoBoxX = width - finalInfoBoxWidth - margin;
    const finalInfoBoxY = precioBoxY + precioBoxHeight + 10;

    // Replace previous box rect if width/height changed
    svg = svg.replace(`    <rect x="${infoBoxX}" y="${infoBoxY}" width="${infoBoxWidth}" height="${infoBoxHeight}" rx="14" fill="${mainBoxFill}" opacity="1" stroke="rgba(0,0,0,0.1)" stroke-width="1" />\n`, `    <rect x="${finalInfoBoxX}" y="${finalInfoBoxY}" width="${finalInfoBoxWidth}" height="${infoBoxHeightFinal}" rx="14" fill="${mainBoxFill}" opacity="1" stroke="rgba(0,0,0,0.1)" stroke-width="1" />\n`);

    // Ahora renderizamos las líneas envueltas dentro del box
    let cursorY = finalInfoBoxY + padding + Math.floor(lineHeight / 2);
    const baseTextX = finalInfoBoxX + 20;
    for (let idx = 0; idx < linesWrapCache.length; idx++) {
      const { ln, parts } = linesWrapCache[idx];
      const iconSvg = ln.icon && (ln.icon.startsWith('<svg') ? ln.icon : svgIconsMain[ln.icon]) ? (ln.icon.startsWith('<svg') ? ln.icon : svgIconsMain[ln.icon]) : null;
      for (let p = 0; p < parts.length; p++) {
        const part = escapeForSvg(parts[p]);
        const textX = baseTextX + (iconSvg && p === 0 ? 22 : 0);
        if (iconSvg && p === 0) {
          const iconX = baseTextX;
          const iconY = cursorY - Math.floor((ln.size || infoSize) * 0.72);
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
        cursorY += (lineHeight + 8);
      }
    }

    // Render corredores box bottom-left if present
    if (corredoresText) {
      const corrFontSize = Math.max(12, Math.floor(width / 80)); // Mismo tamaño que Rialtor.app
      const corrChar = Math.max(6, Math.floor(corrFontSize * 0.6)); // Cambiado a 0.6 para consistencia
      const margin = 20;
      const maxCorrBoxW = Math.min(Math.floor(width * 0.6), 520);
      const estW = corredoresText.length * corrChar + padding * 2;
      const cW = Math.min(maxCorrBoxW, Math.max(200, estW));
      const cMaxChars = Math.max(20, Math.floor((cW - padding * 2) / corrChar));
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
      const cH = Math.max(30, corrParts.length * (Math.max(12, corrFontSize) + 8) + padding);
      const cX = margin;
      const cY = height - 12; // Misma coordenada Y que Rialtor.app (height - originMargin)
      // compute final width to accommodate the longest wrapped part (by chars -> pixels estimate)
      let maxPartLen = 0;
      for (const p of corrParts) if (p.length > maxPartLen) maxPartLen = p.length;
      // Use a more generous character width estimate and add extra margin
      const charWidthGenerous = Math.max(8, Math.floor(corrFontSize * 0.6));
      const neededForParts = maxPartLen * charWidthGenerous + padding * 2;
      const finalCW = Math.min(maxCorrBoxW, Math.max(cW, neededForParts, 200)); // minimum 200px width, más pequeño
      // draw rect with final width - using more translucent white background
      svg += `  <g filter="url(#f1)">\n`;
      svg += `    <rect x="${cX}" y="${cY - cH}" width="${finalCW}" height="${cH}" rx="8" fill="#76685d" opacity="1" stroke="rgba(0,0,0,0.1)" stroke-width="1" />\n`;
      svg += `  </g>\n`;
      // icon and text centered horizontally and vertically
      const centerY = cY - cH + cH / 2;
      const totalLinesHeight = (corrParts.length - 1) * (lineHeight + 8);
      let startY = Math.floor(centerY - totalLinesHeight / 2);
      for (let i = 0; i < corrParts.length; i++) {
        const lineY = startY + i * (lineHeight + 8);
        const textCenterX = cX + finalCW / 2;
        svg += `  <text x="${textCenterX}" y="${lineY}" text-anchor="middle" dominant-baseline="middle" style="font-family: 'DejaVu Sans', Arial, sans-serif; font-size:${corrFontSize}px; fill: #FFFFFF;">${corrParts[i]}</text>\n`;
      }
    }

    const origenText = 'Rialtor.app';
    const origenSafe = escapeForSvg(origenText);
    const origenSize = Math.max(12, Math.floor(width / 80));
    const originMargin = 12;
    const origenX = width - originMargin;
    const origenY = height - originMargin;

    // Render descripcion bottom-right (above logo) if present
    if (descripcion) {
      const descSafe = escapeForSvg(descripcion);
      const descSize = Math.max(12, Math.floor(width / 70));
      const descPadding = 14;

      // Calculate description box dimensions
      const maxDescWidth = Math.min(Math.floor(width * 0.4), 320);
      const charWidth = Math.max(6, Math.floor(descSize * 0.55));
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
    const origenBoxWidth = origenText.length * (origenSize * 0.6) + 36;
    const origenBoxHeight = Math.max(30, origenSize + 18);
    const origenBoxX = width - origenBoxWidth - originMargin;
    const origenBoxY = height - origenBoxHeight - originMargin;
    svg += `  <g filter="url(#f1)">\n`;
    svg += `    <rect x="${origenBoxX}" y="${origenBoxY}" width="${origenBoxWidth}" height="${origenBoxHeight}" rx="8" fill="#76685d" opacity="1" stroke="rgba(0,0,0,0.1)" stroke-width="1" />\n`;
    svg += `  </g>\n`;

    svg += `  <text x="${origenBoxX + 10}" y="${origenBoxY + origenSize * 0.9}" text-anchor="start" style="font-family: 'DejaVu Sans', Arial, sans-serif; font-size: ${origenSize}px; fill: #FFFFFF;">${origenSafe}</text>\n`;

    svg += `</svg>`;
    return svg;
  } catch (e) {
    console.error('[PLACAS] createPlaqueSvgString error:', e);
    throw e;
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
  upload: upload.array('images', 2), // Máximo 2 imágenes
  createPropertyPlaque,
  getUserPlaques,
  getPlaqueById,
  deletePlaque
};

// Export helper for testing
module.exports.createPlaqueSvgString = typeof createPlaqueSvgString !== 'undefined' ? createPlaqueSvgString : null;
