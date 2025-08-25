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

    // Limitar número máximo de imágenes a 2
    if (req.files.length > 2) {
      return res.status(400).json({
        error: 'Límite de imágenes excedido',
        message: 'Solo se permiten hasta 2 imágenes por placa'
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
        status: 'DONE'
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
  try {
    console.log('[PLACAS] Descargando imagen de:', imageUrl);

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
    const superficie = propertyInfo.superficie ? cleanText(propertyInfo.superficie, '', 10) : null;
    const direccion = cleanText(propertyInfo.direccion, 'Ubicación disponible', 40);
    const contacto = cleanText(propertyInfo.contacto, 'Contacto disponible', 30);
    const email = propertyInfo.email ? cleanText(propertyInfo.email, '', 40) : null;
    const corredores = propertyInfo.corredores ? cleanText(propertyInfo.corredores, '', 80) : null; // nombre y matrícula

    // Log para depuración
    console.log('[PLACAS][DEBUG] Overlay fields:', { precio, moneda, tipo, ambientes, superficie, direccion, contacto, email });

    // Escapar texto para insertar en SVG y evitar caracteres inválidos
    function escapeForSvg(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Factorizamos la creación del SVG para poder testearlo y usar iconos SVG inline
    function createPlaqueSvgString(width, height, propertyInfo, imageAnalysis) {
      // Preferir DejaVu Sans. Tamaños dinámicos
      const precioSize = Math.max(28, Math.floor(width / 25));
      const infoSize = Math.max(18, Math.floor(width / 40));
      const contactoSize = Math.max(16, Math.floor(width / 50));
      const labelSize = Math.max(14, Math.floor(width / 60));

      // Iconos inline SVG (pequeños, sin dependencias)
      const svgIcons = {
        ambientes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l9 8h-3v7h-4v-5H10v5H6v-7H3l9-8z" fill="${textColor}"/></svg>`,
        superficie: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="${textColor}" stroke-width="1.5" fill="none"/></svg>`,
        ubicacion: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="${textColor}" stroke-width="1.2" fill="none"/><circle cx="12" cy="9" r="2.5" fill="${textColor}"/></svg>`,
        contacto: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4" stroke="${textColor}" stroke-width="1.2" fill="none"/><path d="M7 10l5 4 5-4" stroke="${textColor}" stroke-width="1.2" fill="none"/></svg>`,
        correo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="${textColor}" stroke-width="1.2" fill="none"/><path d="M3 7l9 6 9-6" stroke="${textColor}" stroke-width="1.2" fill="none"/></svg>`,
        corredores: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zM8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zM16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.98 1.97 3.45V19h6v-2.5C23 14.17 18.33 13 16 13z" fill="${textColor}"/></svg>`
      };

      const lines = [];
      lines.push({ text: `${moneda} ${formatPrice(precio)}`, cls: 'precio', size: precioSize });
      lines.push({ text: tipo, cls: 'info', size: infoSize });
      if (ambientes) lines.push({ icon: svgIcons.ambientes, text: `${ambientes} ambientes`, cls: 'info', size: infoSize });
      if (superficie) lines.push({ icon: svgIcons.superficie, text: `${superficie} m2`, cls: 'info', size: infoSize });
      lines.push({ text: 'Ubicación:', cls: 'label', size: labelSize });
      lines.push({ icon: svgIcons.ubicacion, text: direccion, cls: 'contacto', size: contactoSize });
      lines.push({ text: 'Contacto:', cls: 'label', size: labelSize });
      lines.push({ icon: svgIcons.contacto, text: contacto, cls: 'contacto', size: contactoSize });
      if (email) lines.push({ icon: svgIcons.correo, text: email, cls: 'contacto', size: contactoSize });
      // Corredores con label y texto más pequeño
      if (corredores) {
        lines.push({ text: 'Corredores:', cls: 'label', size: labelSize });
        lines.push({ icon: svgIcons.corredores, text: corredores, cls: 'contacto', size: Math.max(12, contactoSize - 2) });
      }

      const padding = 18;
      const boxMaxWidth = Math.min(420, Math.floor(width * 0.40));
      const baseLineHeight = Math.max(20, Math.floor(width / 70));

      // Truncar líneas largas a un número razonable de caracteres para evitar overflow visual
      const maxCharsPerLine = Math.floor(boxMaxWidth / (Math.max(12, Math.floor(precioSize / 2))));
      function wrapOrTruncate(text) {
        if (!text) return '';
        if (text.length <= maxCharsPerLine) return text;
        return text.slice(0, maxCharsPerLine - 1) + '…';
      }

      const formattedLines = lines.map((ln) => ({ ...ln, text: ln.cls === 'label' ? ln.text : wrapOrTruncate(ln.text) }));

      const lineHeight = baseLineHeight;
      const boxContentHeight = formattedLines.length * (lineHeight + 8);
      const boxWidth = boxMaxWidth;
      const boxHeight = boxContentHeight + padding * 2;

      function choosePosition(ubicacion, w, h, bw, bh) {
        const margin = 20;
        if (!ubicacion || typeof ubicacion !== 'string') {
          return { x: w - bw - margin, y: margin };
        }
        const u = ubicacion.toLowerCase();
        const top = u.includes('superior') || u.includes('arriba') || u.includes('top');
        const bottom = u.includes('inferior') || u.includes('abajo') || u.includes('bottom');
        const left = u.includes('izquierda') || u.includes('left');
        const right = u.includes('derecha') || u.includes('right');

        if (top && left) return { x: margin, y: margin };
        if (top && right) return { x: w - bw - margin, y: margin };
        if (bottom && left) return { x: margin, y: h - bh - margin };
        if (bottom && right) return { x: w - bw - margin, y: h - bh - margin };
        if (left) return { x: margin, y: margin };
        if (right) return { x: w - bw - margin, y: margin };
        if (bottom) return { x: Math.floor((w - bw) / 2), y: h - bh - margin };
        return { x: w - bw - margin, y: margin };
      }

      const pos = choosePosition(imageAnalysis?.ubicacion_texto, width, height, boxWidth, boxHeight);

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
      svg += `      .precio { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${precioSize}px; font-weight: 700; fill: ${textColor}; }\n`;
      svg += `      .info { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${infoSize}px; fill: ${textColor}; font-weight: 500; }\n`;
      svg += `      .contacto { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${contactoSize}px; fill: ${textColor}; }\n`;
      svg += `      .label { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${labelSize}px; fill: ${textColor}; opacity: 0.9; font-weight: 600; }\n`;
      svg += `    ]]></style>\n`;
      svg += `  </defs>\n`;

      // Caja con gradiente, blur y sombra (más profesional)
      svg += `  <g filter="url(#f1)">\n`;
      svg += `    <rect x="${pos.x}" y="${pos.y}" width="${boxWidth}" height="${boxHeight}" rx="14" fill="url(#g1)" opacity="0.95" stroke="rgba(255,255,255,0.08)" stroke-width="1" />\n`;
      svg += `    <rect x="${pos.x}" y="${pos.y}" width="${boxWidth}" height="6" rx="14" fill="rgba(255,255,255,0.06)" />\n`;
      svg += `  </g>\n`;

      // Texto con iconos inline
      let currentY = pos.y + padding + Math.floor(precioSize * 0.9);
      for (let i = 0; i < formattedLines.length; i++) {
        const ln = formattedLines[i];
        const safeText = escapeForSvg(ln.text);
        const textX = pos.x + padding + 8;
        // Si tiene icon, renderizamos el icono SVG inline como un <g> convertido desde string y ajustamos el texto
        if (ln.icon) {
          const iconX = textX;
          const iconY = currentY - Math.floor(precioSize * 0.6);
          // Colocar el icono (ya tiene fill="${textColor}")
          svg += `  <g transform="translate(${iconX}, ${iconY})">${ln.icon}</g>\n`;
          const textPosX = textX + 22; // ancho estimado del icon + gap
          if (ln.cls === 'precio') {
            svg += `  <text x="${textPosX}" y="${currentY}" class="precio">${safeText}</text>\n`;
            currentY += (lineHeight + 6);
            continue;
          }
          if (ln.cls === 'label') {
            svg += `  <text x="${textPosX}" y="${currentY}" class="label">${safeText}</text>\n`;
            currentY += (lineHeight - 2);
            continue;
          }
          svg += `  <text x="${textPosX}" y="${currentY}" class="${ln.cls}">${safeText}</text>\n`;
          currentY += (lineHeight + 6);
          continue;
        }
        // Si es precio, colocarlo en una línea más grande
        if (ln.cls === 'precio') {
          svg += `  <text x="${textX}" y="${currentY}" class="precio">${safeText}</text>\n`;
          currentY += (lineHeight + 6);
          continue;
        }
        // Labels en mayúscula ligera
        if (ln.cls === 'label') {
          svg += `  <text x="${textX}" y="${currentY}" class="label">${safeText}</text>\n`;
          currentY += (lineHeight - 2);
          continue;
        }
        svg += `  <text x="${textX}" y="${currentY}" class="${ln.cls}">${safeText}</text>\n`;
        currentY += (lineHeight + 6);
      }

      // Origen / marca pequeña fuera del recuadro, abajo a la derecha de la imagen
      const origenText = 'Rialtor.app';
      const origenSafe = escapeForSvg(origenText);
      const origenSize = Math.max(12, Math.floor(width / 80));
      const originMargin = 12;
      const origenX = width - originMargin;
      const origenY = height - originMargin;
      svg += `  <text x="${origenX}" y="${origenY}" text-anchor="end" style="font-family: 'DejaVu Sans', Arial, sans-serif; font-size: ${origenSize}px; fill: ${textColor}; opacity:0.85;">${origenSafe}</text>\n`;

      svg += `</svg>`;
      return svg;
    }

    // Generar el SVG llamando a la función factorizada (module-level)
    const svgOverlay = createPlaqueSvgString(width, height, propertyInfo, imageAnalysis);
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
    const superficie = propertyInfo.superficie || null;
    const direccion = propertyInfo.direccion || 'Ubicación disponible';
    const contacto = propertyInfo.contacto || 'Contacto disponible';
    const email = propertyInfo.email || null;
    const corredores = propertyInfo.corredores || null;

    const overlayColor = determineOverlayColor(imageAnalysis && imageAnalysis.colores);
    const textColor = overlayColor === 'rgba(0,0,0,0.8)' ? '#FFFFFF' : '#000000';

    const precioSize = Math.max(28, Math.floor(width / 25));
    const infoSize = Math.max(18, Math.floor(width / 40));
    const contactoSize = Math.max(16, Math.floor(width / 50));
    const labelSize = Math.max(14, Math.floor(width / 60));

    // Iconos inline SVG
    const svgIcons = {
      ambientes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l9 8h-3v7h-4v-5H10v5H6v-7H3l9-8z" fill="${textColor}"/></svg>`,
      superficie: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="${textColor}" stroke-width="1.5" fill="none"/></svg>`,
      ubicacion: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="${textColor}" stroke-width="1.2" fill="none"/><circle cx="12" cy="9" r="2.5" fill="${textColor}"/></svg>`,
      contacto: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4" stroke="${textColor}" stroke-width="1.2" fill="none"/><path d="M7 10l5 4 5-4" stroke="${textColor}" stroke-width="1.2" fill="none"/></svg>`,
      correo: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="${textColor}" stroke-width="1.2" fill="none"/><path d="M3 7l9 6 9-6" stroke="${textColor}" stroke-width="1.2" fill="none"/></svg>`,
      corredores: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zM8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zM16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.98 1.97 3.45V19h6v-2.5C23 14.17 18.33 13 16 13z" fill="${textColor}"/></svg>`
    };

    const lines = [];
    lines.push({ text: `${moneda} ${formatPrice(precio)}`, cls: 'precio', size: precioSize });
    lines.push({ text: tipo, cls: 'info', size: infoSize });
    if (ambientes) lines.push({ icon: svgIcons.ambientes, text: `${ambientes} ambientes`, cls: 'info', size: infoSize });
    if (superficie) lines.push({ icon: svgIcons.superficie, text: `${superficie} m2`, cls: 'info', size: infoSize });
    lines.push({ text: 'Ubicación:', cls: 'label', size: labelSize });
    lines.push({ icon: svgIcons.ubicacion, text: direccion, cls: 'contacto', size: contactoSize });
    lines.push({ text: 'Contacto:', cls: 'label', size: labelSize });
    lines.push({ icon: svgIcons.contacto, text: contacto, cls: 'contacto', size: contactoSize });
    if (email) lines.push({ icon: svgIcons.correo, text: email, cls: 'contacto', size: contactoSize });
    if (corredores) {
      lines.push({ text: 'Corredores:', cls: 'label', size: labelSize });
      // Do not truncate corredores so full names/matriculas remain in the SVG
      lines.push({ icon: svgIcons.corredores, text: corredores, cls: 'contacto', size: Math.max(12, contactoSize - 2), noTruncate: true });
    }

    const padding = 18;
    const boxMaxWidth = Math.min(420, Math.floor(width * 0.40));
    const baseLineHeight = Math.max(20, Math.floor(width / 70));

    const maxCharsPerLine = Math.floor(boxMaxWidth / (Math.max(12, Math.floor(precioSize / 2))));
    function wrapOrTruncate(text) {
      if (!text) return '';
      if (text.length <= maxCharsPerLine) return text;
      return text.slice(0, maxCharsPerLine - 1) + '…';
    }

    // Avoid truncating lines explicitly marked with noTruncate (e.g., corredores)
    const formattedLines = lines.map((ln) => ({ ...ln, text: ln.cls === 'label' || ln.noTruncate ? ln.text : wrapOrTruncate(ln.text) }));

    const lineHeight = baseLineHeight;
    const boxContentHeight = formattedLines.length * (lineHeight + 8);
    const boxWidth = boxMaxWidth;
    const boxHeight = boxContentHeight + padding * 2;

    function choosePosition(ubicacion, w, h, bw, bh) {
      const margin = 20;
      if (!ubicacion || typeof ubicacion !== 'string') {
        return { x: w - bw - margin, y: margin };
      }
      const u = ubicacion.toLowerCase();
      const top = u.includes('superior') || u.includes('arriba') || u.includes('top');
      const bottom = u.includes('inferior') || u.includes('abajo') || u.includes('bottom');
      const left = u.includes('izquierda') || u.includes('left');
      const right = u.includes('derecha') || u.includes('right');

      if (top && left) return { x: margin, y: margin };
      if (top && right) return { x: w - bw - margin, y: margin };
      if (bottom && left) return { x: margin, y: h - bh - margin };
      if (bottom && right) return { x: w - bw - margin, y: h - bh - margin };
      if (left) return { x: margin, y: margin };
      if (right) return { x: w - bw - margin, y: margin };
      if (bottom) return { x: Math.floor((w - bw) / 2), y: h - bh - margin };
      return { x: w - bw - margin, y: margin };
    }

    const pos = choosePosition(imageAnalysis && imageAnalysis.ubicacion_texto, width, height, boxWidth, boxHeight);

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
    svg += `      .precio { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${precioSize}px; font-weight: 700; fill: ${textColor}; }\n`;
    svg += `      .info { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${infoSize}px; fill: ${textColor}; font-weight: 500; }\n`;
    svg += `      .contacto { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${contactoSize}px; fill: ${textColor}; }\n`;
    svg += `      .label { font-family: 'DejaVu Sans', 'Arial', sans-serif; font-size: ${labelSize}px; fill: ${textColor}; opacity: 0.9; font-weight: 600; }\n`;
    svg += `    ]]></style>\n`;
    svg += `  </defs>\n`;

    svg += `  <g filter="url(#f1)">\n`;
    svg += `    <rect x="${pos.x}" y="${pos.y}" width="${boxWidth}" height="${boxHeight}" rx="14" fill="url(#g1)" opacity="0.95" stroke="rgba(255,255,255,0.08)" stroke-width="1" />\n`;
    svg += `    <rect x="${pos.x}" y="${pos.y}" width="${boxWidth}" height="6" rx="14" fill="rgba(255,255,255,0.06)" />\n`;
    svg += `  </g>\n`;

    let currentY = pos.y + padding + Math.floor(precioSize * 0.9);
    for (let i = 0; i < formattedLines.length; i++) {
      const ln = formattedLines[i];
      const safeText = escapeForSvg(ln.text);
      const textX = pos.x + padding + 8;
      if (ln.icon) {
        const iconX = textX;
        const iconY = currentY - Math.floor(precioSize * 0.6);
        svg += `  <g transform="translate(${iconX}, ${iconY})">${ln.icon}</g>\n`;
        const textPosX = textX + 22;
        if (ln.cls === 'precio') {
          svg += `  <text x="${textPosX}" y="${currentY}" class="precio">${safeText}</text>\n`;
          currentY += (lineHeight + 6);
          continue;
        }
        if (ln.cls === 'label') {
          svg += `  <text x="${textPosX}" y="${currentY}" class="label">${safeText}</text>\n`;
          currentY += (lineHeight - 2);
          continue;
        }
        svg += `  <text x="${textPosX}" y="${currentY}" class="${ln.cls}">${safeText}</text>\n`;
        currentY += (lineHeight + 6);
        continue;
      }
      if (ln.cls === 'precio') {
        svg += `  <text x="${textX}" y="${currentY}" class="precio">${safeText}</text>\n`;
        currentY += (lineHeight + 6);
        continue;
      }
      if (ln.cls === 'label') {
        svg += `  <text x="${textX}" y="${currentY}" class="label">${safeText}</text>\n`;
        currentY += (lineHeight - 2);
        continue;
      }
      svg += `  <text x="${textX}" y="${currentY}" class="${ln.cls}">${safeText}</text>\n`;
      currentY += (lineHeight + 6);
    }

    const origenText = 'Rialtor.app';
    const origenSafe = escapeForSvg(origenText);
    const origenSize = Math.max(12, Math.floor(width / 80));
    const originMargin = 12;
    const origenX = width - originMargin;
    const origenY = height - originMargin;
    svg += `  <text x="${origenX}" y="${origenY}" text-anchor="end" style="font-family: 'DejaVu Sans', Arial, sans-serif; font-size: ${origenSize}px; fill: ${textColor}; opacity:0.85;">${origenSafe}</text>\n`;

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
