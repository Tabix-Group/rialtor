
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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
            isActive: true
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

    // Truncar texto para no exceder tokens (usar primeros 4000 caracteres)
    const safeText = text.length > 4000 ? text.substring(0, 4000) : text;

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
      max_tokens: 800,
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
  // Detectar tipo por extensión
  const ext = id.split('.').pop()?.toLowerCase();
  let resourceType = 'raw';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) resourceType = 'image';
  else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) resourceType = 'video';
  // Otros tipos (pdf, docx, xlsx, etc) usan raw
  console.log(`Intentando eliminar en Cloudinary: ${id} (resource_type: ${resourceType})`);
  try {
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

// GET /api/documents - list uploaded files from Cloudinary
router.get('/', async (req, res) => {
  try {
    // Buscar archivos en la carpeta 'documents' de Cloudinary
    const result = await cloudinary.search
      .expression('folder:documents')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();
    const documents = result.resources.map(file => ({
      id: file.public_id,
      title: file.filename || file.public_id.split('/').pop(),
      type: file.format,
      category: 'General', // Puedes guardar la categoría en metadata si lo deseas
      uploadDate: file.created_at,
      size: (file.bytes / 1024).toFixed(1) + ' KB',
      url: file.secure_url
    }));
    if (req.query.countOnly === '1') {
      return res.json({ count: documents.length });
    }
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo obtener la lista de documentos', details: err });
  }
});

// POST /api/documents/generate-reserva
// Body: { campos del formulario de reserva }
// Returns: { documentUrl: 'url del documento generado' }
router.post('/generate-reserva', async (req, res) => {
  console.log('[GENERATE-RESERVA] ===== STARTING REQUEST =====');
  console.log('[GENERATE-RESERVA] Request received:', {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    headers: req.headers
  });

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

    if (!openaiClient) {
      console.error('[GENERATE-RESERVA] OpenAI client not available');
      return res.status(503).json({
        error: 'Servicio de IA no disponible',
        details: 'La clave de API de OpenAI no está configurada'
      });
    }

    console.log('[GENERATE-RESERVA] OpenAI client verified successfully');

    console.log('[GENERATE-RESERVA] Starting document processing...');

    // Usar ruta absoluta directa que sabemos que funciona
    const modeloPath = 'C:\\Users\\Hernan\\Desktop\\TRABAJO\\Rialtor\\remax\\frontend\\public\\docs\\MODELO_RESERVA Y OFERTA DE COMPRA.docx';
    console.log('[GENERATE-RESERVA] Using direct path:', modeloPath);
    console.log('[GENERATE-RESERVA] File exists check:', fs.existsSync(modeloPath));

    if (!fs.existsSync(modeloPath)) {
      console.error('[GENERATE-RESERVA] Model document NOT found at:', modeloPath);
      return res.status(404).json({ error: 'Documento modelo no encontrado' });
    }

    console.log('[GENERATE-RESERVA] Model document found, extracting content...');

    // Extraer el contenido del documento modelo
    const modeloBuffer = fs.readFileSync(modeloPath);
    const modeloResult = await mammoth.extractRawText({ buffer: modeloBuffer });
    let documentoTexto = modeloResult.value;

    console.log('[GENERATE-RESERVA] Content extracted, length:', documentoTexto.length);
    console.log('[GENERATE-RESERVA] First 200 chars of document:', documentoTexto.substring(0, 200));

    // Función para convertir números a letras (mejorada)
    function numeroALetras(num) {
      if (!num || isNaN(num)) return '';
      const numero = parseInt(num);
      if (numero === 0) return 'cero';

      const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
      const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
      const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

      let letras = '';

      // Centenas
      const centena = Math.floor(numero / 100);
      if (centena > 0) {
        if (centena === 1 && numero !== 100) letras += 'ciento ';
        else letras += centenas[centena] + ' ';
      }

      // Decenas y unidades
      const resto = numero % 100;
      if (resto > 0) {
        if (resto < 10) {
          letras += unidades[resto];
        } else if (resto < 20) {
          const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve'];
          letras += especiales[resto - 10];
        } else {
          const decena = Math.floor(resto / 10);
          const unidad = resto % 10;
          letras += decenas[decena];
          if (unidad > 0) {
            letras += ' y ' + unidades[unidad];
          }
        }
      }

      return letras.trim().toUpperCase();
    }

    console.log('[GENERATE-RESERVA] Applying data replacements...');

    // Reemplazos simples y directos
    documentoTexto = documentoTexto.replace(/__________________/g, (match, offset, string) => {
      const context = string.substring(Math.max(0, offset - 100), offset + 100).toLowerCase();

      if (context.includes('dni') || context.includes('documento')) return dniComprador || '__________________';
      if (context.includes('estado civil')) return estadoCivilComprador || '__________________';
      if (context.includes('domicilio') || context.includes('calle')) return domicilioComprador || '__________________';
      if (context.includes('email') || context.includes('correo')) return emailComprador || '__________________';
      if (context.includes('reserva') && context.includes('dólares')) return numeroALetras(montoReserva) || '__________________';
      if (context.includes('venta') && context.includes('dólares')) return numeroALetras(montoTotal) || '__________________';
      if (context.includes('refuerzo') && context.includes('dólares')) return numeroALetras(montoRefuerzo) || '__________________';
      if (context.includes('corredor') || context.includes('sr.')) return nombreCorredor || '__________________';
      if (context.includes('cucicba')) return matriculaCucicba || '__________________';
      if (context.includes('cmcp')) return matriculaCmcpci || '__________________';
      if (context.includes('día') || context.includes('dia')) return dia || '___';
      if (context.includes('mes')) return mes || '___________';
      if (context.includes('año') || context.includes('ano')) return anio || '______';

      // Fallback con nombre o dirección
      return nombreComprador || direccionInmueble || '__________________';
    });

    // Reemplazos específicos para montos
    documentoTexto = documentoTexto.replace(/U\$D\s*____________/g, `U$D ${montoReserva || '____________'}`);
    documentoTexto = documentoTexto.replace(/U\$D\s*___________\.-?\)/g, `U$D ${montoTotal || '__________'}.-)`);
    documentoTexto = documentoTexto.replace(/U\$D\s*_________/g, `U$D ${montoRefuerzo || '_________'}`);

    console.log('[GENERATE-RESERVA] Replacements applied, sending to OpenAI...');

    // Usar OpenAI para procesar el documento con los datos proporcionados
    const systemPrompt = `Eres un asistente especializado en documentos legales inmobiliarios argentinos.
Tu tarea es completar un documento de Reserva y Oferta de Compra reemplazando los campos vacíos con la información proporcionada.

INSTRUCCIONES ESPECÍFICAS:
1. Reemplaza TODOS los campos marcados con __________________ con la información correspondiente
2. Mantén EXACTAMENTE la estructura y formato legal del documento original
3. NO agregues ni elimines texto que no esté en el documento original
4. Si un campo no tiene información, deja el placeholder __________________ original
5. Los montos deben aparecer tanto en números como en letras cuando corresponda
6. Mantén el lenguaje formal y legal del documento argentino
7. NO cambies fechas, cláusulas legales, o cualquier otro contenido que no sean los placeholders

IMPORTANTE: Solo reemplaza los __________________ con los datos proporcionados. El resto del documento debe permanecer idéntico.`;

    const userPrompt = `INFORMACIÓN A COMPLETAR EN EL DOCUMENTO:

Nombre del comprador: ${nombreComprador || '__________________'}
DNI del comprador: ${dniComprador || '__________________'}
Estado civil: ${estadoCivilComprador || '__________________'}
Domicilio: ${domicilioComprador || '__________________'}
Email: ${emailComprador || '__________________'}
Dirección del inmueble: ${direccionInmueble || '__________________'}
Monto de reserva: ${numeroALetras(montoReserva) || '__________________'} (${montoReserva || '__________________'})
Monto total: ${numeroALetras(montoTotal) || '__________________'} (${montoTotal || '__________________'})
Monto de refuerzo: ${numeroALetras(montoRefuerzo) || '__________________'} (${montoRefuerzo || '__________________'})
Nombre del corredor: ${nombreCorredor || '__________________'}
Matrícula CUCICBA: ${matriculaCucicba || '__________________'}
Matrícula CMCP: ${matriculaCmcpci || '__________________'}
Nombre inmobiliaria: ${nombreInmobiliaria || '__________________'}
Día: ${dia || '___'}
Mes: ${mes || '___________'}
Año: ${anio || '______'}

DOCUMENTO A COMPLETAR:
${documentoTexto}

DEVUELVE EL DOCUMENTO COMPLETO con todos los __________________ reemplazados por la información correspondiente. Mantén toda la estructura, formato y contenido legal intacto.`;

    console.log('[GENERATE-RESERVA] Processing document with OpenAI...');
    console.log('[GENERATE-RESERVA] System prompt length:', systemPrompt.length);
    console.log('[GENERATE-RESERVA] User prompt length:', userPrompt.length);

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.1
    });

    console.log('[GENERATE-RESERVA] OpenAI response received');
    console.log('[GENERATE-RESERVA] Completion object:', !!completion);
    console.log('[GENERATE-RESERVA] Choices exist:', !!completion.choices);

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error('[GENERATE-RESERVA] Invalid response from OpenAI');
      return res.status(500).json({
        error: 'Respuesta inválida del servicio de IA',
        details: 'No se recibió una respuesta válida de OpenAI'
      });
    }

    const documentoCompletado = completion.choices[0].message.content;

    if (!documentoCompletado || documentoCompletado.trim().length === 0) {
      console.error('[GENERATE-RESERVA] Generated document is empty');
      return res.status(500).json({
        error: 'Documento generado vacío',
        details: 'OpenAI no generó contenido válido'
      });
    }

    console.log('[GENERATE-RESERVA] Document generated successfully, length:', documentoCompletado.length);

    // Crear un nombre único para el documento
    const timestamp = Date.now();
    const nombreArchivo = `Reserva_Oferta_Compra_${timestamp}.docx`;

    // Por ahora, devolver el documento como texto
    // En una implementación completa, generaríamos un archivo Word real
    console.log('[GENERATE-RESERVA] Sending response to client');
    console.log('[GENERATE-RESERVA] ===== REQUEST COMPLETED =====');

    res.json({
      success: true,
      documentContent: documentoCompletado,
      fileName: nombreArchivo,
      message: 'Documento generado exitosamente'
    });

  } catch (error) {
    console.error('[GENERATE-RESERVA] Error generating document:', error);
    res.status(500).json({
      error: 'Error al generar el documento',
      details: error.message
    });
  }
});

// POST /api/documents/test-generate - endpoint de prueba para generar
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


module.exports = router;

// POST /api/documents/diagnose - endpoint de diagn�stico
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
