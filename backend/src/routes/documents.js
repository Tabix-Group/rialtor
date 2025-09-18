
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
const mammoth = require('mammoth');
const OpenAI = require('openai');

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

// POST /api/documents/summary
// Body: { id: '<cloudinary_public_id>' }
// Returns: { summary: '...' }
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

    // Truncar texto para no exceder tokens (usar primeros 4000 caracteres)
    const safeText = text.length > 4000 ? text.substring(0, 4000) : text;

    // Pedimos al modelo un JSON estricto con resumen + entidades para extraer montos,
    // personas, direcciones, fechas y otros datos relevantes. Si no puede devolver JSON,
    // hacemos fallback a la respuesta de texto simple para mantener compatibilidad.
    const systemPrompt = 'Eres un asistente experto en documentos legales e inmobiliarios. ' +
      'Resumes y extraes datos importantes en español.';

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

    // Helper: buscar montos, cuotas y porcentajes directamente en el texto como respaldo
    const extractAmountsFromText = (txt) => {
      if (!txt) return [];
      const out = new Set();
      const patterns = [
        /(?:USD|US\$|U\$S|US\$)\s?[\d\.,]+/gi,
        /\b[\d\.,]+\s?(?:USD|US\$|U\$S|ARS|AR\$|pesos|d[oó]lares|dolares)\b/gi,
        /\$\s?[\d\.,]+/g,
        /\b[\d\.,]+\s?(?:pesos|peso|d[oó]lar|dolares|cuotas|cuota)\b/gi,
        /(?:en\s)?[0-9]{1,3}\s?(?:cuotas|cuota)\b/gi,
        /[0-9]+(?:[\.,][0-9]{1,2})?\s?%/g
      ];
      for (const re of patterns) {
        let m;
        while ((m = re.exec(txt)) !== null) {
          let val = m[0].trim();
          // Normalize separators: keep original but collapse multiple spaces
          val = val.replace(/\s+/g, ' ');
          out.add(val);
        }
      }
      return Array.from(out);
    };

    // Intentar parsear JSON estricto. Si falla, buscar un JSON dentro del texto.
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

    // Si tenemos parsed, asegurarnos de que amounts contenga valores (si no, extraerlos del texto)
    if (parsed && parsed.summary) {
      try {
        parsed.amounts = Array.isArray(parsed.amounts) ? parsed.amounts : [];
        if (parsed.amounts.length === 0) {
          const found = extractAmountsFromText(text);
          if (found.length) parsed.amounts = parsed.amounts.concat(found);
        }
      } catch (e) {
        // noop
      }
      return res.json({ summary: String(parsed.summary).trim(), extracted: parsed });
    }

    // Si no pudimos parsear JSON del modelo, construimos un objeto extraído mínimo usando regex
    const fallbackAmounts = extractAmountsFromText(text);
    if (fallbackAmounts.length) {
      const built = {
        summary: content.trim().split('\n').slice(0, 3).join(' '),
        amounts: fallbackAmounts,
        persons: [],
        addresses: [],
        dates: [],
        relevant: []
      };
      return res.json({ summary: built.summary, extracted: built });
    }

    // Fallback final: devolver el texto completo que haya devuelto el modelo como summary
    console.warn('[DOCUMENTS] No se pudo parsear JSON de OpenAI y no se detectaron montos por regex. Devolviendo texto crudo.');
    return res.json({ summary: content.trim() });
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

    // Validar campos requeridos
    if (!nombreComprador || !dniComprador || !direccionInmueble || !montoReserva || !montoTotal) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['nombreComprador', 'dniComprador', 'direccionInmueble', 'montoReserva', 'montoTotal']
      });
    }

    if (!openaiClient) {
      console.error('[RESERVA] Cliente OpenAI no disponible');
      return res.status(503).json({
        error: 'Servicio de IA no disponible',
        details: 'La clave de API de OpenAI no está configurada'
      });
    }

    console.log('[RESERVA] Cliente OpenAI verificado correctamente');

    console.log('[RESERVA] Iniciando procesamiento del documento...');

    // Leer el documento modelo
    const fs = require('fs');
    const path = require('path');
    const mammoth = require('mammoth');

    const modeloPath = path.join(__dirname, '../../frontend/public/docs/MODELO_RESERVA Y OFERTA DE COMPRA.docx');
    console.log('[RESERVA] Buscando documento modelo en:', modeloPath);

    if (!fs.existsSync(modeloPath)) {
      console.error('[RESERVA] Documento modelo NO encontrado en:', modeloPath);
      return res.status(404).json({ error: 'Documento modelo no encontrado' });
    }

    console.log('[RESERVA] Documento modelo encontrado, extrayendo contenido...');

    // Extraer el contenido del documento modelo
    const modeloBuffer = fs.readFileSync(modeloPath);
    const modeloResult = await mammoth.extractRawText({ buffer: modeloBuffer });
    let documentoTexto = modeloResult.value;

    console.log('[RESERVA] Contenido extraído, longitud:', documentoTexto.length);

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

    console.log('[RESERVA] Aplicando reemplazos de datos...');

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

    console.log('[RESERVA] Reemplazos aplicados, enviando a OpenAI...');

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

    console.log('[RESERVA] Procesando documento con OpenAI...');
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.1
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error('[RESERVA] Respuesta inválida de OpenAI');
      return res.status(500).json({
        error: 'Respuesta inválida del servicio de IA',
        details: 'No se recibió una respuesta válida de OpenAI'
      });
    }

    const documentoCompletado = completion.choices[0].message.content;

    if (!documentoCompletado || documentoCompletado.trim().length === 0) {
      console.error('[RESERVA] Documento generado vacío');
      return res.status(500).json({
        error: 'Documento generado vacío',
        details: 'OpenAI no generó contenido válido'
      });
    }

    console.log('[RESERVA] Documento generado exitosamente, longitud:', documentoCompletado.length);

    // Crear un nombre único para el documento
    const timestamp = Date.now();
    const nombreArchivo = `Reserva_Oferta_Compra_${timestamp}.docx`;

    // Por ahora, devolver el documento como texto
    // En una implementación completa, generaríamos un archivo Word real
    res.json({
      success: true,
      documentContent: documentoCompletado,
      fileName: nombreArchivo,
      message: 'Documento generado exitosamente'
    });

  } catch (error) {
    console.error('[RESERVA] Error generando documento:', error);
    res.status(500).json({
      error: 'Error al generar el documento',
      details: error.message
    });
  }
});

module.exports = router;

