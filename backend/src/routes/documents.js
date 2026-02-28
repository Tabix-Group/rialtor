
const express = require('express');
console.log('BACKEND ARRANCÓ: Documentos API cargada');
const router = express.Router();
// Log global para depuración de cualquier petición al router
router.use((req, res, next) => {
  console.log(`[DOCUMENTS ROUTER] ${req.method} ${req.originalUrl}`);
  next();
});
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../cloudinary');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');    // Leer el documento modelo
const { OpenAI } = require('openai');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Initialize OpenAI client if key exists (kept local to this router to avoid touching chatController)
let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const key = process.env.OPENAI_API_KEY;
  const safeKey = key.length > 8 ? key.substring(0, 4) + '...' + key.substring(key.length - 4) : key;
  console.log('[DOCUMENTS] OpenAI key detected:', safeKey);
} else {
  console.log('[DOCUMENTS] OPENAI_API_KEY NOT FOUND');
}

// Multer en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado'));
    }
  }
});

// POST /api/documents - upload a file a Cloudinary
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  const category = req.body.category || 'General';
  try {
    const originalName = req.file.originalname;
    // Determine Cloudinary folder based on category from the frontend.
    // For the summary view we expect the frontend to send category: 'ChatUpload'
    // and those files should be stored under 'chatdocs'. Default remains 'documents'.
    const folderName = (req.body && req.body.category === 'ChatUpload') ? 'chatdocs' : 'documents';
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: folderName,
        public_id: originalName,
        use_filename: true,
        unique_filename: false,
        overwrite: true
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Error al subir a Cloudinary', details: error });
        }
        let extractedText = '';
        try {
          if (req.file.mimetype === 'application/pdf') {
            extractedText = (await pdfParse(req.file.buffer)).text;
          } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            extractedText = (await mammoth.extractRawText({ buffer: req.file.buffer })).value;
          } else if (req.file.mimetype === 'text/plain') {
            extractedText = req.file.buffer.toString('utf-8');
          }
        } catch (err) {
          extractedText = '';
        }
        // Guardar en la base
        await prisma.documentTemplate.create({
          data: {
            name: originalName,
            title: originalName,
            category,
            url: result.secure_url,
            cloudinaryId: result.public_id,
            content: extractedText,
            description: '',
            template: '',
            fields: '',
            isActive: true,
            userId: req.user.id // Agregar userId
          }
        });
        const metadata = {
          id: result.public_id,
          title: originalName,
          type: req.file.mimetype,
          category,
          uploadDate: new Date(),
          size: (req.file.size / 1024).toFixed(1) + ' KB',
          url: result.secure_url
        };
        return res.status(201).json({ document: metadata });
      }
    );
    stream.end(req.file.buffer);
  } catch (err) {
    return res.status(500).json({ error: 'Error inesperado', details: err });
  }
});

// Función para identificar el tipo de documento basado en su contenido
function identifyDocumentType(text) {
  const lowerText = text.toLowerCase();

  // Verificar cada tipo de documento en orden de prioridad
  if (lowerText.includes('crédito hipotecario') || lowerText.includes('credito hipotecario')) {
    return 'Reserva Compra c/ Crédito Hipotecario';
  }

  if (lowerText.includes('locación temporario') || lowerText.includes('locacion temporario') ||
    lowerText.includes('alquiler temporario')) {
    return 'Reserva Locación Temporario';
  }

  if (lowerText.includes('caba') && (lowerText.includes('locación') || lowerText.includes('locacion') ||
    lowerText.includes('alquiler'))) {
    return 'Reserva Locación en CABA';
  }

  if ((lowerText.includes('provincia') || lowerText.includes('buenos aires')) &&
    (lowerText.includes('locación') || lowerText.includes('locacion') || lowerText.includes('alquiler'))) {
    return 'Reserva Locación en Provincia';
  }

  if (lowerText.includes('oferta de compra') || lowerText.includes('reserva y oferta') ||
    (lowerText.includes('compra') && lowerText.includes('venta'))) {
    return 'Reserva y Oferta de Compra';
  }

  return 'Documento Desconocido';
}

// Función para extraer datos específicos según el tipo de documento
async function extractDocumentData(text, documentType) {
  console.log(`[EXTRACT] Extrayendo datos para tipo: ${documentType}`);

  const systemPrompt = `Eres un asistente especializado en la extracción de datos de documentos legales inmobiliarios argentinos.
Tu tarea es analizar el texto de un documento y extraer únicamente la información específica solicitada.
Devuelve SOLO un objeto JSON válido sin texto adicional.`;

  let userPrompt = '';

  switch (documentType) {
    case 'Reserva y Oferta de Compra':
      userPrompt = `Del siguiente documento de Reserva y Oferta de Compra, extrae ÚNICAMENTE esta información en formato JSON:

{
  "dadorReserva": {
    "nombre": "Nombre completo del comprador",
    "dni": "Número de DNI",
    "estadoCivil": "Estado civil",
    "domicilio": "Dirección completa",
    "email": "Correo electrónico"
  },
  "inmueble": {
    "direccion": "Dirección del inmueble"
  },
  "montos": {
    "reserva": "Monto de reserva en USD (solo números)",
    "totalVenta": "Monto total de venta en USD (solo números)",
    "refuerzo": "Monto de refuerzo en USD (solo números)"
  },
  "corredor": {
    "nombre": "Nombre del corredor inmobiliario",
    "matriculaCucicba": "Matrícula CUCICBA",
    "matriculaCmcp": "Matrícula CMCP"
  },
  "inmobiliaria": {
    "nombre": "Nombre de la inmobiliaria"
  },
  "plazos": {
    "aceptacionOferta": "Plazo para aceptar la oferta (días hábiles)",
    "firmaBoleto": "Plazo para firma del boleto/escritura (días)",
    "devolucionReserva": "Plazo para devolver reserva si no se aprueba (horas)",
    "entregaRefuerzo": "Plazo para entregar refuerzo (días hábiles)"
  },
  "penalidades": {
    "desistimientoDador": "Consecuencias si desiste el dador",
    "desistimientoVendedor": "Consecuencias si desiste el vendedor"
  }
}

Si no encuentras algún dato, usa null o string vacío.`;
      break;

    case 'Reserva Compra c/ Crédito Hipotecario':
      userPrompt = `Del siguiente documento de Reserva de Compra con Crédito Hipotecario, extrae ÚNICAMENTE esta información en formato JSON:

{
  "dadorReserva": {
    "nombre": "Nombre completo",
    "dni": "Número de DNI",
    "domicilio": "Dirección",
    "email": "Correo electrónico"
  },
  "inmueble": {
    "direccion": "Dirección del inmueble"
  },
  "creditoHipotecario": {
    "banco": "Nombre del banco",
    "sucursal": "Sucursal del banco",
    "condicionSuspensiva": "Descripción de la condición suspensiva",
    "plazoAprobacion": "Plazo para aprobación (días)",
    "plazoProrroga": "Posibilidad de prórroga"
  },
  "montos": {
    "reserva": "Monto de reserva en USD",
    "totalVenta": "Monto total de venta en USD",
    "refuerzo": "Monto de refuerzo en USD"
  },
  "plazos": {
    "aceptacion": "Plazo para aceptación (días hábiles)",
    "escritura": "Plazo para escritura (días)",
    "tramitesCredito": "Plazo para iniciar trámites (horas)",
    "notificacionAprobacion": "Plazo para notificar aprobación (horas)"
  },
  "penalidades": {
    "desistimientoDador": "Consecuencias por desistimiento del dador",
    "desistimientoVendedor": "Consecuencias por desistimiento del vendedor"
  }
}

Si no encuentras algún dato, usa null o string vacío.`;
      break;

    case 'Reserva Locación en CABA':
      userPrompt = `Del siguiente documento de Reserva de Locación en CABA, extrae ÚNICAMENTE esta información en formato JSON:

{
  "interesado": {
    "nombre": "Nombre completo",
    "dni": "Número de DNI",
    "domicilio": "Dirección",
    "telefono": "Número de teléfono",
    "email": "Correo electrónico"
  },
  "inmueble": {
    "direccion": "Dirección del departamento en CABA"
  },
  "condicionesAlquiler": {
    "duracion": "Duración del contrato",
    "fechaInicio": "Fecha de inicio",
    "fechaVencimiento": "Fecha de vencimiento",
    "alquilerInicial": "Monto del alquiler inicial",
    "actualizacion": "Tipo de actualización (IPC, etc.)",
    "garantia": "Tipo de garantía",
    "depositoGarantia": "Monto del depósito de garantía"
  },
  "plazos": {
    "presentacionDocumentacion": "Plazo para presentar documentación (horas)",
    "aceptacionPropietario": "Plazo para aceptación del propietario (días hábiles)",
    "firmaContrato": "Plazo para firma del contrato"
  },
  "penalidades": {
    "noAceptacionPropietario": "Consecuencias si no acepta el propietario",
    "informesInsatisfactorios": "Consecuencias si informes no son satisfactorios",
    "arrepentimientoInteresado": "Consecuencias si se arrepiente el interesado"
  }
}

Si no encuentras algún dato, usa null o string vacío.`;
      break;

    case 'Reserva Locación en Provincia':
      userPrompt = `Del siguiente documento de Reserva de Locación en Provincia, extrae ÚNICAMENTE esta información en formato JSON:

{
  "interesado": {
    "nombre": "Nombre completo",
    "dni": "Número de DNI",
    "domicilio": "Dirección",
    "telefono": "Número de teléfono celular",
    "email": "Correo electrónico"
  },
  "inmueble": {
    "direccion": "Dirección del departamento en Buenos Aires"
  },
  "condicionesAlquiler": {
    "duracion": "Duración del contrato (meses)",
    "fechaInicio": "Fecha estimada de inicio",
    "fechaVencimiento": "Fecha estimada de vencimiento",
    "alquilerInicial": "Monto del alquiler inicial en pesos",
    "actualizacion": "Tipo de actualización (IPC, etc.)",
    "garantia": "Tipo de garantía (seguro de caución)",
    "depositoGarantia": "Monto del depósito de garantía en USD"
  },
  "plazos": {
    "presentacionDocumentacion": "Plazo para entregar documentación (horas)",
    "aceptacionPropietario": "Plazo para aceptación (días hábiles)",
    "firmaContrato": "Plazo para firma del contrato"
  },
  "penalidades": {
    "noAceptacionPropietario": "Consecuencias si no acepta el propietario",
    "informesInsatisfactorios": "Consecuencias si informes no son satisfactorios",
    "arrepentimientoInteresado": "Consecuencias si se arrepiente el interesado"
  },
  "gastos": {
    "honorariosMartillero": "Porcentaje de honorarios del martillero"
  }
}

Si no encuentras algún dato, usa null o string vacío.`;
      break;

    case 'Reserva Locación Temporario':
      userPrompt = `Del siguiente documento de Reserva de Locación Temporario, extrae ÚNICAMENTE esta información en formato JSON:

{
  "huesped": {
    "nombre": "Nombre completo",
    "dni": "Número de DNI",
    "domicilio": "Dirección"
  },
  "propiedad": {
    "direccion": "Dirección del inmueble"
  },
  "fechasDuracion": {
    "ingresoDiaHora": "Día y hora de ingreso",
    "egresoDiaHora": "Día y hora de egreso",
    "duracionTotal": "Duración total del contrato"
  },
  "condicionesEconomicas": {
    "reserva": "Monto de la reserva",
    "alquilerTotal": "Monto total del alquiler",
    "arba": "Monto correspondiente a ARBA",
    "jardineroPiletero": "Monto por jardinero/piletero",
    "honorariosInmobiliaria": "Monto de honorarios de la inmobiliaria",
    "depositoGarantia": "Monto del depósito de garantía",
    "saldoFirma": "Saldo a pagar en la firma del contrato"
  },
  "lugarFirma": "Lugar donde se firmará el contrato",
  "penalidades": {
    "arrepentimientoHuesped": "Consecuencias si se arrepiente el huésped"
  },
  "condicionesDevolucion": {
    "depositoGarantia": "Condiciones para devolución del depósito de garantía"
  }
}

Si no encuentras algún dato, usa null o string vacío.`;
      break;

    default:
      return {
        tipo: 'Desconocido',
        mensaje: 'No se pudo identificar el tipo de documento específico'
      };
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt + '\n\nDOCUMENTO:\n' + text }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });

    const content = completion?.choices?.[0]?.message?.content || '{}';

    // Intentar parsear el JSON
    try {
      const extractedData = JSON.parse(content);
      console.log(`[EXTRACT] Datos extraídos exitosamente para ${documentType}`);
      return extractedData;
    } catch (parseError) {
      console.error('[EXTRACT] Error parseando JSON:', parseError);
      return {
        error: 'Error al parsear la respuesta de OpenAI',
        rawResponse: content
      };
    }

  } catch (error) {
    console.error('[EXTRACT] Error en extracción de datos:', error);
    return {
      error: 'Error al procesar el documento',
      details: error.message
    };
  }
}

// POST /api/documents/summary
// Body: { id: '<cloudinary_public_id>' }
// Returns: { summary: '...', documentType: '...', extractedData: {...} }
router.post('/summary', async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Falta el id del documento' });

    // Buscar en la DB el contenido extraído
    const doc = await prisma.documentTemplate.findFirst({ where: { cloudinaryId: id } });
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado en la base de datos' });

    const text = (doc.content || '').trim();
    if (!text) return res.status(422).json({ error: 'El documento no contiene texto extraído para resumir' });

    if (!openaiClient) {
      return res.status(503).json({ error: 'Servicio de IA no disponible' });
    }

    // Identificar el tipo de documento
    const documentType = identifyDocumentType(text);
    console.log('[DOCUMENTS] Tipo de documento identificado:', documentType);

    // Extraer datos específicos según el tipo
    const extractedData = await extractDocumentData(text, documentType);

    // Truncar texto inteligentemente para no exceder tokens
    // Para documentos grandes (>50KB), usar Smart Chunking
    let safeText = text;
    if (text.length > 50000) {
      // Encontrar último párrafo completo dentro del límite
      safeText = text.substring(0, 8000);
      const lastPeriod = safeText.lastIndexOf('.');
      if (lastPeriod > 4000) {
        safeText = text.substring(0, lastPeriod + 1);
      }
    } else if (text.length > 4000) {
      safeText = text.substring(0, 8000);
      const lastPeriod = safeText.lastIndexOf('.');
      if (lastPeriod > 0) {
        safeText = text.substring(0, lastPeriod + 1);
      }
    }

    // Generar resumen general
    const systemPrompt = 'Eres un asistente experto en documentos legales e inmobiliarios. ' +
      'Resume y extraes datos importantes en español.';

    const userPrompt = `A partir del siguiente texto de un documento, devuelve ÚNICAMENTE un objeto JSON válido con esta estructura:
{
  "summary": "resumen en español en 3 líneas",
  "amounts": ["lista de montos y monedas detectadas, por ejemplo 'USD 1.000.000'"],
  "persons": ["nombres de personas o entidades mencionadas"],
  "addresses": ["direcciones o ubicaciones mencionadas"],
  "dates": ["fechas relevantes mencionadas"],
  "relevant": ["otros datos relevantes: cláusulas, objetos del contrato, porcentajes, plazos, etc"]
}

Si algún campo no aplica, devuélvelo como lista vacía. Lee el texto a continuación y extrae la información.
Texto:
${safeText}`;

    console.log('[DOCUMENTS] Llamando a OpenAI para resumen estructurado del documento', id);
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.1
    });

    const content = completion?.choices?.[0]?.message?.content || null;
    if (!content) return res.status(500).json({ error: 'No se obtuvo respuesta de OpenAI' });

    // Intentar parsear JSON estricto
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      try {
        const m = content.match(/\{[\s\S]*\}/);
        if (m) {
          parsed = JSON.parse(m[0]);
        }
      } catch (e2) {
        parsed = null;
      }
    }

    // Preparar respuesta final
    const response = {
      summary: parsed?.summary || content.trim(),
      documentType: documentType,
      extractedData: extractedData,
      extracted: parsed || {}
    };

    return res.json(response);

  } catch (err) {
    console.error('[DOCUMENTS] Error en /summary:', err);
    return res.status(500).json({ error: 'Error al generar el resumen', details: err.message || err });
  }
});

// DELETE /api/documents/:id - delete a file by route param
// DELETE /api/documents/:id - delete a file from Cloudinary by route param
router.delete('/*', async (req, res) => {
  let id = req.params[0];
  if (!id) return res.status(400).json({ error: 'Falta el id del documento' });
  id = decodeURIComponent(id);
  if (!id.startsWith('documents/')) {
    id = 'documents/' + id;
  }

  try {
    // Verificar que el documento pertenece al usuario
    const doc = await prisma.documentTemplate.findFirst({
      where: {
        cloudinaryId: id,
        userId: req.user.id
      }
    });

    if (!doc) {
      return res.status(404).json({ error: 'Documento no encontrado o no autorizado' });
    }

    // Detectar tipo por extensión
    const ext = id.split('.').pop()?.toLowerCase();
    let resourceType = 'raw';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) resourceType = 'image';
    else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) resourceType = 'video';
    // Otros tipos (pdf, docx, xlsx, etc) usan raw
    console.log(`Intentando eliminar en Cloudinary: ${id} (resource_type: ${resourceType})`);
    const result = await cloudinary.uploader.destroy(id, { resource_type: resourceType });
    console.log('Resultado de Cloudinary:', result);
    if (result.result === 'ok' || result.result === 'not_found') {
      // Eliminar de la base de datos
      await prisma.documentTemplate.deleteMany({ where: { cloudinaryId: id } });
      return res.json({ message: `Archivo eliminado correctamente (${id})` });
    } else {
      return res.status(500).json({ error: 'No se pudo eliminar el archivo', details: result });
    }
  } catch (err) {
    console.error('Error al eliminar en Cloudinary:', id, err);
    return res.status(500).json({ error: 'Error al eliminar en Cloudinary', details: err.message || err });
  }
});

// GET /api/documents/stats - get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Documentos activos del usuario
    const activeDocuments = await prisma.documentTemplate.count({
      where: {
        userId: userId,
        isActive: true
      }
    });

    // Historial de calculadoras usado por el usuario
    const calculatorUsage = await prisma.calculatorHistory.count({
      where: {
        userId: userId
      }
    });

    // Sesiones de chat del usuario
    const chatSessions = await prisma.chatSession.count({
      where: {
        userId: userId
      }
    });

    // Placas generadas por el usuario
    const generatedPlaques = await prisma.propertyPlaque.count({
      where: {
        userId: userId,
        status: 'COMPLETED'
      }
    });

    // Calcular tiempo ahorrado estimado (basado en herramientas usadas)
    const totalToolsUsed = calculatorUsage + chatSessions + generatedPlaques;
    const estimatedTimeSaved = totalToolsUsed * 30; // 30 minutos por herramienta usada

    // Calcular porcentajes de crecimiento (comparando con el mes anterior)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const documentsLastMonth = await prisma.documentTemplate.count({
      where: {
        userId: userId,
        isActive: true,
        createdAt: {
          lt: now,
          gte: lastMonth
        }
      }
    });

    const toolsLastMonth = await prisma.calculatorHistory.count({
      where: {
        userId: userId,
        createdAt: {
          lt: now,
          gte: lastMonth
        }
      }
    }) + await prisma.chatSession.count({
      where: {
        userId: userId,
        createdAt: {
          lt: now,
          gte: lastMonth
        }
      }
    }) + await prisma.propertyPlaque.count({
      where: {
        userId: userId,
        status: 'COMPLETED',
        createdAt: {
          lt: now,
          gte: lastMonth
        }
      }
    });

    const documentsGrowth = documentsLastMonth > 0 ? ((activeDocuments - documentsLastMonth) / documentsLastMonth * 100) : 0;
    const toolsGrowth = toolsLastMonth > 0 ? ((totalToolsUsed - toolsLastMonth) / toolsLastMonth * 100) : 0;
    const timeGrowth = toolsGrowth; // Asumimos que el crecimiento del tiempo es igual al de herramientas

    res.json({
      activeDocuments: activeDocuments,
      documentsGrowth: Math.round(documentsGrowth),
      toolsUsed: totalToolsUsed,
      toolsGrowth: Math.round(toolsGrowth),
      timeSaved: estimatedTimeSaved,
      timeGrowth: Math.round(timeGrowth)
    });

  } catch (err) {
    console.error('[DOCUMENTS] Error getting stats:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas', details: err.message });
  }
});

// GET /api/documents - get user documents
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { countOnly } = req.query;

    if (countOnly === '1') {
      // Solo devolver el conteo para optimización
      const count = await prisma.documentTemplate.count({
        where: {
          userId: userId,
          isActive: true
        }
      });
      return res.json({ count });
    }

    // Obtener documentos del usuario
    const documents = await prisma.documentTemplate.findMany({
      where: {
        userId: userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        title: true,
        category: true,
        url: true,
        cloudinaryId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatear respuesta para compatibilidad con el frontend
    const formattedDocuments = documents.map(doc => ({
      id: doc.cloudinaryId,
      title: doc.title || doc.name,
      name: doc.name,
      type: 'document', // Tipo genérico
      uploadDate: doc.createdAt,
      url: doc.url,
      category: doc.category
    }));

    res.json({
      documents: formattedDocuments,
      total: formattedDocuments.length
    });

  } catch (err) {
    console.error('[DOCUMENTS] Error getting documents:', err);
    res.status(500).json({ error: 'Error al obtener documentos', details: err.message });
  }
});

// POST /api/documents/generate-reserva
// Body: { campos del formulario de reserva }
// Returns: { documentUrl: 'url del documento generado' }
router.post('/generate-reserva', async (req, res) => {
  console.log('[GENERATE-RESERVA] ===== STARTING REQUEST =====');
  console.log('[GENERATE-RESERVA] Request received at:', new Date().toISOString());

  try {
    const {
      nombreComprador,
      dniComprador,
      estadoCivilComprador,
      domicilioComprador,
      emailComprador,
      direccionInmueble,
      montoReserva,
      montoTotal,
      montoRefuerzo,
      nombreCorredor,
      matriculaCucicba,
      matriculaCmcpci,
      nombreInmobiliaria,
      dia,
      mes,
      anio
    } = req.body;

    console.log('[GENERATE-RESERVA] Extracted data:', {
      nombreComprador,
      dniComprador,
      direccionInmueble,
      montoReserva,
      montoTotal
    });

    // Validar campos requeridos
    if (!nombreComprador || !dniComprador || !direccionInmueble || !montoReserva || !montoTotal) {
      console.log('[GENERATE-RESERVA] Validation failed - missing required fields');
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['nombreComprador', 'dniComprador', 'direccionInmueble', 'montoReserva', 'montoTotal']
      });
    }

    console.log('[GENERATE-RESERVA] Generating document with embedded template...');

    // Generate document using embedded template (no external file dependency)
    const documentoCompletado = generateBasicTemplate(req.body);

    console.log('[GENERATE-RESERVA] Document generated successfully, length:', documentoCompletado.length);

    // Crear un nombre único para el documento
    const timestamp = Date.now();
    const nombreArchivoBase = `Reserva_Oferta_Compra_${timestamp}`;

    console.log('[GENERATE-RESERVA] Sending response to client');
    console.log('[GENERATE-RESERVA] ===== REQUEST COMPLETED =====');

    res.json({
      success: true,
      documentContent: documentoCompletado,
      fileName: `${nombreArchivoBase}.txt`,
      wordFileName: `${nombreArchivoBase}.docx`,
      pdfFileName: `${nombreArchivoBase}.pdf`,
      message: 'Documento generado exitosamente'
    });

  } catch (error) {
    console.error('[GENERATE-RESERVA] Error generating document:', error);
    res.status(500).json({
      error: 'Error al generar el documento',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});// POST /api/documents/test-generate - endpoint de prueba para generar
router.post('/test-generate', async (req, res) => {
  console.log('[TEST-GENERATE] Test endpoint called');
  try {
    // Simular datos de prueba
    const testData = {
      nombreComprador: 'Juan Pérez',
      dniComprador: '12345678',
      estadoCivilComprador: 'soltero',
      domicilioComprador: 'Calle Falsa 123',
      emailComprador: 'juan@test.com',
      direccionInmueble: 'Av. Siempre Viva 742',
      montoReserva: '10000',
      montoTotal: '200000',
      montoRefuerzo: '5000',
      nombreCorredor: 'María García',
      matriculaCucicba: '12345',
      matriculaCmcpci: '67890',
      nombreInmobiliaria: 'Inmobiliaria Test',
      dia: '15',
      mes: 'octubre',
      anio: '2024'
    };

    console.log('[TEST-GENERATE] Using test data:', testData);

    // Verificar OpenAI
    if (!openaiClient) {
      return res.status(503).json({ error: 'OpenAI client not configured' });
    }

    // Verificar archivo modelo
    const modeloPath = 'C:\\Users\\Hernan\\Desktop\\TRABAJO\\Rialtor\\remax\\frontend\\public\\docs\\MODELO_RESERVA Y OFERTA DE COMPRA.docx';
    if (!fs.existsSync(modeloPath)) {
      return res.status(404).json({ error: 'Model file not found' });
    }

    console.log('[TEST-GENERATE] All checks passed, attempting to generate...');

    // Extraer contenido del modelo
    const modeloBuffer = fs.readFileSync(modeloPath);
    const modeloResult = await mammoth.extractRawText({ buffer: modeloBuffer });
    const documentoTexto = modeloResult.value;

    console.log('[TEST-GENERATE] Document content extracted, length:', documentoTexto.length);

    // Llamada simple a OpenAI
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Eres un asistente que completa documentos legales.' },
        { role: 'user', content: `Completa este documento con los datos: ${JSON.stringify(testData)}\n\nDocumento:\n${documentoTexto.substring(0, 1000)}` }
      ],
      max_tokens: 1000,
      temperature: 0.1
    });

    const result = completion.choices[0].message.content;

    console.log('[TEST-GENERATE] Generation completed successfully');

    res.json({
      success: true,
      message: 'Test generation successful',
      result: result ? result.substring(0, 200) + '...' : 'No content'
    });

  } catch (error) {
    console.error('[TEST-GENERATE] Error:', error);
    res.status(500).json({
      error: 'Test generation failed',
      details: error.message
    });
  }
});


// Function to generate a basic template when model file is not found
function generateBasicTemplate(data) {
  const {
    nombreComprador = '',
    dniComprador = '',
    estadoCivilComprador = '',
    domicilioComprador = '',
    emailComprador = '',
    direccionInmueble = '',
    montoReserva = '',
    montoTotal = '',
    montoRefuerzo = '',
    nombreCorredor = '',
    matriculaCucicba = '',
    matriculaCmcpci = '',
    nombreInmobiliaria = '',
    dia = '',
    mes = '',
    anio = ''
  } = data;

  function numeroALetras(num) {
    if (!num || isNaN(num)) return '';
    const numero = parseInt(num);
    if (numero === 0) return 'CERO';

    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
    const miles = ['', 'MIL', 'DOS MIL', 'TRES MIL', 'CUATRO MIL', 'CINCO MIL', 'SEIS MIL', 'SIETE MIL', 'OCHO MIL', 'NUEVE MIL'];

    // Handle millions
    if (numero >= 1000000) {
      const millones = Math.floor(numero / 1000000);
      const resto = numero % 1000000;
      let resultado = millones === 1 ? 'UN MILLON' : numeroALetras(millones) + ' MILLONES';
      if (resto > 0) resultado += ' ' + numeroALetras(resto);
      return resultado;
    }

    // Handle thousands
    if (numero >= 1000) {
      const mil = Math.floor(numero / 1000);
      const resto = numero % 1000;
      let resultado = mil === 1 ? 'MIL' : numeroALetras(mil) + ' MIL';
      if (resto > 0) resultado += ' ' + numeroALetras(resto);
      return resultado;
    }

    // Handle hundreds
    if (numero >= 100) {
      const centena = Math.floor(numero / 100);
      const resto = numero % 100;
      if (centena === 1 && resto === 0) return 'CIEN';
      return centenas[centena] + (resto > 0 ? ' ' + numeroALetras(resto) : '');
    }

    // Handle tens
    if (numero >= 20) {
      const decena = Math.floor(numero / 10);
      const unidad = numero % 10;
      return decenas[decena] + (unidad > 0 ? ' Y ' + unidades[unidad] : '');
    }

    // Handle teens
    if (numero >= 10) {
      const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
      return especiales[numero - 10];
    }

    // Handle units
    return unidades[numero];
  } const template = `
RESERVA Y OFERTA DE COMPRA

En la Ciudad de Buenos Aires, a los ${dia || '__'} días del mes de ${mes || '__________'} del año ${anio || '____'}, el/la Sr./Sra. ${nombreComprador || '____________________'}, D.N.I. N° ${dniComprador || '______________'}, estado civil ${estadoCivilComprador || '__________'}, con domicilio en ${domicilioComprador || '________________________________'}, email: ${emailComprador || '____________________'}, en adelante denominado "EL DADOR DE LA RESERVA", reserva el inmueble sito en ${direccionInmueble || '________________________________'}.

MONTO DE LA RESERVA:
El Dador de la Reserva entrega en este acto la suma de USD ${montoReserva ? Number(montoReserva).toLocaleString() : '____________'} (${numeroALetras(montoReserva) || 'PESOS ______________'}) en concepto de reserva.

MONTO TOTAL DE LA OPERACIÓN:
El precio total de venta del inmueble es de USD ${montoTotal ? Number(montoTotal).toLocaleString() : '____________'} (${numeroALetras(montoTotal) || 'PESOS ______________'}).

${montoRefuerzo ? `REFUERZO DE RESERVA:
Se establece un refuerzo de reserva por USD ${Number(montoRefuerzo).toLocaleString()} (${numeroALetras(montoRefuerzo)}).` : ''}

CORREDOR INMOBILIARIO:
${nombreCorredor || 'Nombre del corredor: ____________________'}
${matriculaCucicba ? `Matrícula CUCICBA: ${matriculaCucicba}` : 'Matrícula CUCICBA: ____________________'}
${matriculaCmcpci ? `Matrícula CMCP: ${matriculaCmcpci}` : 'Matrícula CMCP: ____________________'}
${nombreInmobiliaria ? `Inmobiliaria: ${nombreInmobiliaria}` : 'Inmobiliaria: ____________________'}

CONDICIONES:
- La presente reserva tendrá una vigencia de 10 (diez) días hábiles.
- En caso de aceptación por parte del vendedor, se procederá a la firma del boleto de compraventa.
- Si la operación no se concreta por causas imputables al vendedor, se devolverá el doble de la reserva.
- Si la operación no se concreta por causas imputables al comprador, se perderá la reserva entregada.

FIRMAS:

________________________                    ________________________
Firma del Dador de Reserva                    Firma del Corredor


Fecha: ${dia || '__'}/${mes || '__'}/${anio || '____'}

DOCUMENTO GENERADO AUTOMÁTICAMENTE - PLANTILLA BÁSICA
`;

  return template.trim();
}

// POST /api/documents/test-basic - endpoint de prueba básico sin OpenAI
router.post('/test-basic', async (req, res) => {
  console.log('[TEST-BASIC] Basic test endpoint called');
  try {
    const testData = req.body;
    console.log('[TEST-BASIC] Received data:', Object.keys(testData));

    // Verificar archivo modelo
    const modeloPath = 'C:\\Users\\Hernan\\Desktop\\TRABAJO\\Rialtor\\remax\\frontend\\public\\docs\\MODELO_RESERVA Y OFERTA DE COMPRA.docx';
    const fileExists = fs.existsSync(modeloPath);

    let documentContent = '';
    if (fileExists) {
      try {
        const modeloBuffer = fs.readFileSync(modeloPath);
        const modeloResult = await mammoth.extractRawText({ buffer: modeloBuffer });
        documentContent = modeloResult.value.substring(0, 200) + '...';
      } catch (error) {
        documentContent = 'Error reading file: ' + error.message;
      }
    }

    console.log('[TEST-BASIC] Test completed successfully');

    res.json({
      success: true,
      message: 'Test básico exitoso',
      timestamp: new Date().toISOString(),
      checks: {
        fileExists,
        documentPreview: documentContent,
        dataReceived: !!testData,
        dataKeys: Object.keys(testData)
      }
    });

  } catch (error) {
    console.error('[TEST-BASIC] Error:', error);
    res.status(500).json({
      error: 'Test básico falló',
      details: error.message
    });
  }
});

// ============================================================
// DocuSmart — Extracción inteligente de campos seleccionados
// POST /api/documents/docusmart
// Body (multipart): file + selectedFields (JSON array of field IDs)
// Documents are stored in Cloudinary for 30 days then auto-deleted
// ============================================================

const DOCUSMART_FIELDS = {
  bloque_a_1:  { block: 'A', blockName: 'Identidad de la operación', label: 'Tipo de documento',                     prompt: 'Tipo de documento: Escritura, Boleto de compraventa, Cesión, u otro' },
  bloque_a_2:  { block: 'A', blockName: 'Identidad de la operación', label: 'Tipo de operación',                     prompt: 'Tipo de operación: Compra-venta, Cesión de boleto, Permuta, Donación, u otro' },
  bloque_a_3:  { block: 'A', blockName: 'Identidad de la operación', label: 'Fecha del documento',                   prompt: 'Fecha de celebración u otorgamiento del documento' },
  bloque_a_4:  { block: 'A', blockName: 'Identidad de la operación', label: 'Jurisdicción',                          prompt: 'Jurisdicción: CABA, PBA/AMBA, u otra provincia' },
  bloque_a_5:  { block: 'A', blockName: 'Identidad de la operación', label: 'Inmobiliaria/s interviniente/s',        prompt: 'Nombre/s de la/s inmobiliaria/s o corredor/es intervinientes' },

  bloque_b_6:  { block: 'B', blockName: 'Partes', label: 'Vendedor/es (nombre + DNI/CUIT)',                          prompt: 'Nombre completo y DNI o CUIT de cada vendedor' },
  bloque_b_7:  { block: 'B', blockName: 'Partes', label: 'Estado civil + régimen patrimonial del vendedor',          prompt: 'Estado civil del vendedor/es y régimen patrimonial (sociedad conyugal, separación de bienes, etc.)' },
  bloque_b_8:  { block: 'B', blockName: 'Partes', label: 'Comprador/es (nombre + DNI/CUIT)',                         prompt: 'Nombre completo y DNI o CUIT de cada comprador' },
  bloque_b_9:  { block: 'B', blockName: 'Partes', label: 'Representación: apoderado (sí/no)',                        prompt: '¿Alguna parte actúa por apoderado? Sí o No. Si sí, indicar quién.' },
  bloque_b_10: { block: 'B', blockName: 'Partes', label: 'Datos del poder (escribano / fecha / registro)',           prompt: 'Datos del poder notarial si existe: nombre del escribano, fecha, número de registro/protocolo' },

  bloque_c_11: { block: 'C', blockName: 'Inmueble', label: 'Domicilio del inmueble',                                 prompt: 'Dirección completa del inmueble (calle, número, piso, depto, localidad)' },
  bloque_c_12: { block: 'C', blockName: 'Inmueble', label: 'Matrícula / datos registrales',                          prompt: 'Número de matrícula del Registro de la Propiedad Inmueble' },
  bloque_c_13: { block: 'C', blockName: 'Inmueble', label: 'Partida (ARBA / ABL)',                                   prompt: 'Número de partida inmobiliaria ARBA (provincia) o ABL (CABA)' },
  bloque_c_14: { block: 'C', blockName: 'Inmueble', label: 'Nomenclatura catastral',                                 prompt: 'Nomenclatura catastral: Circunscripción, Sección, Manzana, Parcela' },
  bloque_c_15: { block: 'C', blockName: 'Inmueble', label: 'Tipo de inmueble',                                       prompt: 'Tipo: Casa, Departamento, PH, Lote, Local, Oficina, u otro' },
  bloque_c_16: { block: 'C', blockName: 'Inmueble', label: 'Unidad funcional / complementaria',                      prompt: 'Número de unidad funcional y/o complementaria (cochera, baulera) si es PH o edificio' },
  bloque_c_17: { block: 'C', blockName: 'Inmueble', label: 'Superficie cubierta',                                    prompt: 'Superficie cubierta en m²' },
  bloque_c_18: { block: 'C', blockName: 'Inmueble', label: 'Superficie descubierta',                                 prompt: 'Superficie descubierta (terraza, jardín, patio) en m²' },
  bloque_c_19: { block: 'C', blockName: 'Inmueble', label: 'Superficie total',                                       prompt: 'Superficie total del inmueble en m²' },

  bloque_d_20: { block: 'D', blockName: 'Dominio y cargas', label: 'Titularidad coincide con informe',               prompt: '¿La titularidad registral del vendedor coincide con el informe de dominio? Sí, No, o No informado' },
  bloque_d_21: { block: 'D', blockName: 'Dominio y cargas', label: 'Tipo de dominio',                                prompt: 'Dominio: Pleno, Condominio (indicar partes indivisas), Usufructo, Nuda propiedad, u otro' },
  bloque_d_22: { block: 'D', blockName: 'Dominio y cargas', label: 'Usufructo (sí/no + titulares)',                  prompt: '¿Existe usufructo? Sí o No. Si sí, indicar los titulares del usufructo.' },
  bloque_d_23: { block: 'D', blockName: 'Dominio y cargas', label: 'Hipoteca (sí/no + estado)',                      prompt: '¿Existe hipoteca? Sí o No. Si sí: estado (vigente, cancelable en el acto, cancelada)' },
  bloque_d_24: { block: 'D', blockName: 'Dominio y cargas', label: 'Embargo (sí/no)',                                prompt: '¿Existe embargo sobre el inmueble o las partes? Sí o No' },
  bloque_d_25: { block: 'D', blockName: 'Dominio y cargas', label: 'Inhibición (sí/no)',                             prompt: '¿Existe inhibición general de bienes? Sí o No' },
  bloque_d_26: { block: 'D', blockName: 'Dominio y cargas', label: 'Protección de vivienda / bien de familia',       prompt: '¿El inmueble tiene afectación a protección de vivienda (ex bien de familia)? Sí o No' },
  bloque_d_27: { block: 'D', blockName: 'Dominio y cargas', label: 'Servidumbres / restricciones',                   prompt: '¿Existen servidumbres, restricciones al dominio u otras afectaciones? Sí o No. Si sí, describir brevemente.' },

  bloque_e_28: { block: 'E', blockName: 'Económico', label: 'Precio total',                                          prompt: 'Precio total de la operación (en números y en letras si consta)' },
  bloque_e_29: { block: 'E', blockName: 'Económico', label: 'Moneda',                                                prompt: 'Moneda: Pesos argentinos (ARS), Dólares (USD), u otra' },
  bloque_e_30: { block: 'E', blockName: 'Económico', label: 'Forma de pago',                                         prompt: 'Forma de pago: Transferencia, Efectivo, Crédito hipotecario, Mixto. Describir.' },
  bloque_e_31: { block: 'E', blockName: 'Económico', label: 'Anticipo / seña / reserva',                             prompt: 'Monto del anticipo, seña o reserva entregado o pactado' },
  bloque_e_32: { block: 'E', blockName: 'Económico', label: 'Saldo',                                                 prompt: 'Monto del saldo a pagar y oportunidad (escritura, posesión, etc.)' },
  bloque_e_33: { block: 'E', blockName: 'Económico', label: 'Condición crédito hipotecario',                         prompt: '¿La operación está sujeta a crédito hipotecario? Sí o No. Si sí, banco interviniente.' },
  bloque_e_34: { block: 'E', blockName: 'Económico', label: 'Origen de fondos declarado',                            prompt: '¿Se declara el origen lícito de los fondos (art. 303 CCCN o UIAF)? Sí o No' },

  bloque_f_35: { block: 'F', blockName: 'Plazos y entrega', label: 'Fecha máxima de escrituración',                  prompt: 'Fecha límite para la escrituración (en boleto de compraventa)' },
  bloque_f_36: { block: 'F', blockName: 'Plazos y entrega', label: 'Modalidad de posesión',                          prompt: 'Posesión: Inmediata a la firma, Diferida (indicar fecha/condición), u Ocupada' },
  bloque_f_37: { block: 'F', blockName: 'Plazos y entrega', label: 'Fecha de entrega de posesión',                   prompt: 'Fecha o plazo para la entrega de la posesión del inmueble' },
  bloque_f_38: { block: 'F', blockName: 'Plazos y entrega', label: 'Llaves: cuándo y contra qué',                    prompt: 'Condición de entrega de llaves: cuándo y contra qué evento o pago' },

  bloque_g_39: { block: 'G', blockName: 'Cláusulas de conflicto', label: 'Penalidad incumplimiento comprador',       prompt: 'Consecuencia/penalidad si el comprador incumple (pérdida de seña, multas, etc.)' },
  bloque_g_40: { block: 'G', blockName: 'Cláusulas de conflicto', label: 'Penalidad incumplimiento vendedor',        prompt: 'Consecuencia/penalidad si el vendedor incumple (devolución doble de seña, multas, etc.)' },
  bloque_g_41: { block: 'G', blockName: 'Cláusulas de conflicto', label: 'Distribución de gastos',                   prompt: 'Quién paga cada gasto: escribanía, sellos, impuesto de transferencia, ITI, plusvalía, etc.' },
  bloque_g_42: { block: 'G', blockName: 'Cláusulas de conflicto', label: 'Comisión inmobiliaria',                    prompt: 'Porcentaje de comisión, quién la paga (comprador, vendedor, ambos) y cuándo' },
  bloque_g_43: { block: 'G', blockName: 'Cláusulas de conflicto', label: 'Condiciones suspensivas/resolutorias',     prompt: 'Condiciones suspensivas o resolutorias: texto de la cláusula y tipo' },
};

async function cleanupExpiredDocuSmartDocs() {
  try {
    const now = new Date();
    const docs = await prisma.documentTemplate.findMany({ where: { category: 'DocuSmart' } });
    const expired = docs.filter(doc => {
      try {
        const meta = JSON.parse(doc.fields || '{}');
        return meta.expiresAt && new Date(meta.expiresAt) < now;
      } catch { return false; }
    });
    for (const doc of expired) {
      try {
        if (doc.cloudinaryId) {
          const ext = (doc.cloudinaryId.split('.').pop() || '').toLowerCase();
          const resourceType = ['jpg','jpeg','png','gif','bmp','webp'].includes(ext) ? 'image' : 'raw';
          await cloudinary.uploader.destroy(doc.cloudinaryId, { resource_type: resourceType });
        }
        await prisma.documentTemplate.delete({ where: { id: doc.id } });
        console.log(`[DOCUSMART] Deleted expired doc: ${doc.cloudinaryId}`);
      } catch (e) {
        console.error(`[DOCUSMART] Error deleting doc ${doc.id}:`, e.message);
      }
    }
    if (expired.length > 0) console.log(`[DOCUSMART] Cleaned up ${expired.length} expired document(s)`);
  } catch (e) {
    console.error('[DOCUSMART] Cleanup error:', e.message);
  }
}

router.post('/docusmart', upload.single('file'), async (req, res) => {
  cleanupExpiredDocuSmartDocs().catch(() => {});

  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

  let selectedFields;
  try { selectedFields = JSON.parse(req.body.selectedFields || '[]'); }
  catch { return res.status(400).json({ error: 'selectedFields debe ser un array JSON válido' }); }

  if (!Array.isArray(selectedFields) || selectedFields.length === 0) {
    return res.status(400).json({ error: 'Debes seleccionar al menos un campo a extraer' });
  }

  if (!openaiClient) return res.status(503).json({ error: 'Servicio de IA no disponible' });

  try {
    // 1. Extract text from file
    let extractedText = '';
    try {
      if (req.file.mimetype === 'application/pdf') {
        extractedText = (await pdfParse(req.file.buffer)).text;
      } else if (
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        req.file.mimetype === 'application/msword'
      ) {
        extractedText = (await mammoth.extractRawText({ buffer: req.file.buffer })).value;
      } else if (req.file.mimetype === 'text/plain') {
        extractedText = req.file.buffer.toString('utf-8');
      }
    } catch (err) { extractedText = ''; }

    if (!extractedText.trim()) {
      return res.status(422).json({ error: 'No se pudo extraer texto del documento. Verifica que no sea un PDF escaneado (imagen).' });
    }

    // 2. Upload to Cloudinary (docusmart folder)
    const originalName = req.file.originalname;
    let cloudinaryResult = null;
    await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'docusmart',
          public_id: `${Date.now()}_${originalName}`,
          use_filename: false,
          unique_filename: true,
          overwrite: false
        },
        (error, result) => { if (error) reject(error); else { cloudinaryResult = result; resolve(result); } }
      );
      stream.end(req.file.buffer);
    });

    // 3. Persist in DB with 30-day expiry stored in fields column as JSON
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const dbDoc = await prisma.documentTemplate.create({
      data: {
        name: originalName,
        title: originalName,
        category: 'DocuSmart',
        url: cloudinaryResult?.secure_url || '',
        cloudinaryId: cloudinaryResult?.public_id || '',
        content: extractedText.substring(0, 50000),
        description: 'DocuSmart extraction',
        template: '',
        fields: JSON.stringify({ expiresAt, selectedFields }),
        isActive: true,
        userId: req.user.id
      }
    });

    // 4. Build targeted OpenAI prompt with only selected fields
    const validFields = selectedFields.filter(id => DOCUSMART_FIELDS[id]);
    if (validFields.length === 0) return res.status(400).json({ error: 'Ninguno de los campos seleccionados es válido' });

    const fieldDescriptions = validFields.map(id => {
      const f = DOCUSMART_FIELDS[id];
      return `- "${id}" (${f.label}): ${f.prompt}`;
    }).join('\n');

    const safeText = extractedText.length > 14000 ? extractedText.substring(0, 14000) : extractedText;

    const systemPrompt = `Eres un asistente experto en documentos legales e inmobiliarios argentinos (escrituras, boletos de compraventa, cesiones, reservas).
Extrae únicamente la información solicitada. Si un dato no figura en el documento usa null. Responde SOLO con JSON válido, sin texto adicional.`;

    const emptySchema = Object.fromEntries(validFields.map(id => [id, null]));
    const userPrompt = `Del siguiente documento, extrae estos campos:\n${fieldDescriptions}\n\nDevuelve SOLO este JSON (rellena los valores o deja null):\n${JSON.stringify(emptySchema, null, 2)}\n\nDOCUMENTO:\n${safeText}`;

    console.log(`[DOCUSMART] OpenAI call: ${validFields.length} fields, doc ${dbDoc.id}`);

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    let extracted = {};
    try {
      extracted = JSON.parse(completion?.choices?.[0]?.message?.content || '{}');
    } catch {
      const match = (completion?.choices?.[0]?.message?.content || '').match(/\{[\s\S]*\}/);
      if (match) try { extracted = JSON.parse(match[0]); } catch { extracted = {}; }
    }

    // 5. Build enriched response
    const results = {};
    for (const fieldId of validFields) {
      const f = DOCUSMART_FIELDS[fieldId];
      results[fieldId] = {
        block: f.block,
        blockName: f.blockName,
        label: f.label,
        value: extracted[fieldId] !== undefined ? extracted[fieldId] : null
      };
    }

    return res.json({
      documentId: dbDoc.id,
      documentName: originalName,
      expiresAt,
      results,
      fieldsExtracted: validFields.length,
      fieldsFound: Object.values(results).filter(r => r.value !== null && r.value !== '').length
    });

  } catch (err) {
    console.error('[DOCUSMART] Error:', err);
    return res.status(500).json({ error: 'Error al procesar el documento', details: err.message });
  }
});

module.exports = router;// POST /api/documents/diagnose - endpoint de diagn�stico
router.post('/diagnose', (req, res) => {
  console.log('[DIAGNOSE] ===== DIAGNOSTIC REQUEST =====');
  console.log('[DIAGNOSE] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[DIAGNOSE] Body:', JSON.stringify(req.body, null, 2));
  console.log('[DIAGNOSE] Method:', req.method);
  console.log('[DIAGNOSE] URL:', req.originalUrl);
  console.log('[DIAGNOSE] OpenAI configured:', !!openaiClient);
  console.log('[DIAGNOSE] Model file exists:', fs.existsSync('C:\\\\Users\\\\Hernan\\\\Desktop\\\\TRABAJO\\\\Rialtor\\\\remax\\\\frontend\\\\public\\\\docs\\\\MODELO_RESERVA Y OFERTA DE COMPRA.docx'));

  res.json({
    success: true,
    message: 'Diagnostic completed',
    timestamp: new Date().toISOString(),
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime()
    },
    config: {
      openaiConfigured: !!openaiClient,
      modelFileExists: fs.existsSync('C:\\\\Users\\\\Hernan\\\\Desktop\\\\TRABAJO\\\\Rialtor\\\\remax\\\\frontend\\\\public\\\\docs\\\\MODELO_RESERVA Y OFERTA DE COMPRA.docx'),
      port: process.env.PORT || 3003,
      nodeEnv: process.env.NODE_ENV
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      hasAuth: !!req.headers.authorization,
      contentType: req.headers['content-type']
    }
  });
});
