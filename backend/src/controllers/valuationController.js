require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();

// Reutilizar el mismo cliente OpenAI del chatController
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.log('[DEBUG] OPENAI_API_KEY NOT FOUND');
}

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// Prompt especializado en tasaciones inmobiliarias argentinas
const VALUATION_SYSTEM_PROMPT = `Eres un tasador profesional inmobiliario argentino especializado en valuaciones residenciales y comerciales. Tu objetivo es proporcionar estimaciones precisas de valor de propiedades.

**TUS RESPONSABILIDADES:**
1. Analizar datos de propiedades argentinas
2. Considerar ubicación geográfica, tipo de propiedad, antigüedad, amenities, estado general
3. Usar información actualizada del mercado inmobiliario argentino
4. Proporcionar un rango de valuación (mínimo y máximo) en dólares USD
5. Justificar el rango basándote en datos de mercado

**FACTORES CRÍTICOS DE VALUACIÓN:**
- Tipo de propiedad: Casa, Departamento, Local, Oficina o Terreno tienen diferentes valoraciones
- Antigüedad: Propiedades más nuevas suelen tener mayor valor
- Ubicación: Dirección específica, accesibilidad, infraestructura local
- Superficie: Metros cubiertos vs descubiertos
- Características: Ambientes, baños, amenities especiales

**CONTEXTO ARGENTINO:**
- Mercado inmobiliario de CABA, GBA y provincias
- Influencia de ubicación, accesibilidad, infraestructura
- Variaciones de precio por tipo de propiedad (departamento, casa, PH, terreno)
- Condiciones actuales del mercado argentino
- Impacto de antigüedad en el valor de la propiedad

**REQUISITOS DE RESPUESTA:**
Proporciona SIEMPRE una respuesta JSON VÁLIDA con esta estructura exacta:
{
  "valorMinimo": <número>,
  "valorMaximo": <número>,
  "moneda": "USD",
  "analisis": "<explicación detallada del rango de valuación>",
  "factoresConsiderados": [<lista de factores del mercado que influyeron>]
}

No incluyas nunca markdown, ni backticks, ni ningún texto fuera del JSON.`;

/**
 * Construye el prompt de entrada para la valuación
 * @param {Object} propertyData - Datos de la propiedad
 * @returns {String} - Prompt formateado
 */
function buildValuationPrompt(propertyData) {
  const {
    provincia,
    localidad,
    direccion,
    tipoPropiedad,
    antiguedad,
    metrosCubiertos,
    metrosDescubiertos,
    ambientes,
    banos,
    amenities,
    otrosDatos,
  } = propertyData;

  return `Por favor, valúa la siguiente propiedad y proporciona una estimación de valor en USD.

**DATOS DE LA PROPIEDAD:**
- Provincia: ${provincia}
- Localidad: ${localidad}
${direccion ? `- Dirección: ${direccion}` : ''}
${tipoPropiedad ? `- Tipo de Propiedad: ${tipoPropiedad}` : ''}
${antiguedad !== undefined && antiguedad !== null ? `- Antigüedad: ${antiguedad} años` : ''}
- Metros Cubiertos: ${metrosCubiertos} m²
- Metros Descubiertos: ${metrosDescubiertos} m²
- Ambientes: ${ambientes}
- Baños: ${banos}
- Amenities: ${amenities || 'No especificados'}
${otrosDatos ? `- Otros Datos: ${otrosDatos}` : ''}

Analiza estos datos considerando:
1. Tipo de propiedad (residencial, comercial, terreno)
2. Antigüedad y estado general de la propiedad
3. Ubicación y accesibilidad
4. Tamaño y distribución
5. Amenities y características especiales
6. Condiciones actuales del mercado inmobiliario argentino

Proporciona un rango de valuación realista en dólares USD con análisis detallado.`;
}

/**
 * Crea una nueva valuación
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function createValuation(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const {
      provincia,
      localidad,
      direccion,
      tipoPropiedad,
      antiguedad,
      metrosCubiertos,
      metrosDescubiertos,
      ambientes,
      banos,
      amenities,
      otrosDatos,
    } = req.body;

    // Validación de campos requeridos
    if (
      !provincia ||
      !localidad ||
      metrosCubiertos === undefined ||
      metrosDescubiertos === undefined ||
      ambientes === undefined ||
      banos === undefined
    ) {
      return res
        .status(400)
        .json({ error: 'Faltan campos requeridos de la propiedad' });
    }

    // Validación de tipoPropiedad si se proporciona
    const tiposValidos = ['casa', 'departamento', 'local', 'oficina', 'terreno'];
    if (tipoPropiedad && !tiposValidos.includes(tipoPropiedad.toLowerCase())) {
      return res
        .status(400)
        .json({
          error: 'Tipo de propiedad inválido. Valores permitidos: casa, departamento, local, oficina, terreno'
        });
    }

    // Validación de antiguedad si se proporciona
    if (antiguedad !== undefined && antiguedad !== null) {
      const antiguedadNum = parseInt(antiguedad);
      if (isNaN(antiguedadNum) || antiguedadNum < 0) {
        return res
          .status(400)
          .json({ error: 'La antigüedad debe ser un número no negativo' });
      }
    }

    if (!openai) {
      return res
        .status(500)
        .json({ error: 'OpenAI no está configurado correctamente' });
    }

    // Preparar datos de la propiedad
    const propertyData = {
      provincia,
      localidad,
      direccion: direccion || null,
      tipoPropiedad: tipoPropiedad ? tipoPropiedad.toLowerCase() : null,
      antiguedad: antiguedad !== undefined && antiguedad !== null ? parseInt(antiguedad) : null,
      metrosCubiertos: parseInt(metrosCubiertos),
      metrosDescubiertos: parseInt(metrosDescubiertos),
      ambientes: parseInt(ambientes),
      banos: parseInt(banos),
      amenities: amenities || '',
      otrosDatos: otrosDatos || null,
    };

    // Construir prompt
    const userPrompt = buildValuationPrompt(propertyData);

    // Llamar a OpenAI con GPT-4o (web search habilitado)
    const response = await openai.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: VALUATION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponseText =
      response.choices[0]?.message?.content || '{}';

    // Parsear respuesta JSON de OpenAI
    let aiResponseData;
    try {
      aiResponseData = JSON.parse(aiResponseText);
    } catch (parseError) {
      console.error('[VALUATION] Error parsing OpenAI response:', aiResponseText);
      return res.status(500).json({
        error: 'Error procesando respuesta de IA',
        details: aiResponseText,
      });
    }

    // Validar que tenemos valores numéricos
    const valorMinimo = parseFloat(aiResponseData.valorMinimo);
    const valorMaximo = parseFloat(aiResponseData.valorMaximo);

    if (isNaN(valorMinimo) || isNaN(valorMaximo)) {
      console.error('[VALUATION] Invalid numeric values from AI:', aiResponseData);
      return res.status(500).json({
        error: 'La IA no pudo generar valores válidos',
      });
    }

    // Guardar en base de datos
    const valuation = await prisma.valuation.create({
      data: {
        ...propertyData,
        valorMinimo,
        valorMaximo,
        analisisIA: JSON.stringify(aiResponseData),
        userId,
      },
    });

    res.json({
      success: true,
      id: valuation.id,
      valorMinimo: valuation.valorMinimo,
      valorMaximo: valuation.valorMaximo,
      analisis: aiResponseData.analisis || '',
      factoresConsiderados: aiResponseData.factoresConsiderados || [],
    });
  } catch (error) {
    console.error('[VALUATION] Error creating valuation:', error);
    res.status(500).json({
      error: 'Error creando tasación',
      details: error.message,
    });
  }
}

/**
 * Obtiene todas las valuaciones del usuario
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getValuations(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const valuations = await prisma.valuation.findMany({
      where: { userId },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        provincia: true,
        localidad: true,
        direccion: true,
        tipoPropiedad: true,
        antiguedad: true,
        metrosCubiertos: true,
        metrosDescubiertos: true,
        ambientes: true,
        banos: true,
        valorMinimo: true,
        valorMaximo: true,
        createdAt: true,
      },
    });

    const total = await prisma.valuation.count({ where: { userId } });

    res.json({
      success: true,
      data: valuations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('[VALUATION] Error fetching valuations:', error);
    res.status(500).json({ error: 'Error obteniendo valuaciones' });
  }
}

/**
 * Obtiene una tasación específica
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getValuationById(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const valuation = await prisma.valuation.findUnique({
      where: { id },
    });

    if (!valuation) {
      return res.status(404).json({ error: 'Tasación no encontrada' });
    }

    // Verificar que pertenece al usuario
    if (valuation.userId !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta tasación' });
    }

    // Parsear analisisIA si es string
    const analisisIA =
      typeof valuation.analisisIA === 'string'
        ? JSON.parse(valuation.analisisIA)
        : valuation.analisisIA;

    res.json({
      success: true,
      data: {
        ...valuation,
        analisisIA,
      },
    });
  } catch (error) {
    console.error('[VALUATION] Error fetching valuation:', error);
    res.status(500).json({ error: 'Error obteniendo tasación' });
  }
}

/**
 * Elimina una tasación
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function deleteValuation(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const valuation = await prisma.valuation.findUnique({
      where: { id },
    });

    if (!valuation) {
      return res.status(404).json({ error: 'Tasación no encontrada' });
    }

    // Verificar que pertenece al usuario
    if (valuation.userId !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta tasación' });
    }

    await prisma.valuation.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Tasación eliminada',
    });
  } catch (error) {
    console.error('[VALUATION] Error deleting valuation:', error);
    res.status(500).json({ error: 'Error eliminando tasación' });
  }
}

module.exports = {
  createValuation,
  getValuations,
  getValuationById,
  deleteValuation,
};
