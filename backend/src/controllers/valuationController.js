require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const axios = require('axios');

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

/**
 * Obtiene la cotización USD/ARS actual
 */
async function getUSDARSRate() {
  try {
    const response = await axios.get('https://dolarapi.com/v1/dolares', {
      timeout: 3000,
      headers: {
        'User-Agent': 'RIALTOR/1.0'
      }
    });
    
    const data = response.data;
    const oficial = data.find(d => d.casa === 'oficial');
    
    if (oficial && oficial.venta) {
      return oficial.venta;
    }
    
    // Fallback a base de datos si la API falla
    return await getUSDARSRateFromDB();
  } catch (error) {
    console.warn('[VALUATION] Error fetching USD/ARS from API, using DB:', error.message);
    return await getUSDARSRateFromDB();
  }
}

/**
 * Función auxiliar para obtener cotización desde BD
 */
async function getUSDARSRateFromDB() {
  try {
    const latestRate = await prisma.economicIndex.findFirst({
      where: { indicator: 'dolarOficialVenta' },
      orderBy: { date: 'desc' }
    });
    
    return latestRate?.value || 1000; // Fallback si no hay datos
  } catch (error) {
    console.warn('[VALUATION] Error fetching USD/ARS from DB:', error.message);
    return 1000; // Fallback a valor conservador
  }
}

// Prompt especializado en tasaciones inmobiliarias argentinas
const VALUATION_SYSTEM_PROMPT = `Eres un tasador profesional inmobiliario argentino especializado en valuaciones residenciales y comerciales. Tu objetivo es proporcionar estimaciones precisas de valor de propiedades Y alquileres.

**TUS RESPONSABILIDADES:**
1. Analizar datos de propiedades argentinas
2. Considerar ubicación geográfica, tipo de propiedad, antigüedad, amenities, estado general
3. Usar información actualizada del mercado inmobiliario argentino
4. Proporcionar un rango de valuación (mínimo y máximo) en dólares USD
5. Calcular el alquiler mensual estimado (5% para residencial, 6% para comercial del valor de compraventa)
6. Justificar el rango basándote en datos de mercado

**FACTORES CRÍTICOS DE VALUACIÓN:**
- Tipo de propiedad: Casa, Departamento, Local, Oficina o Terreno tienen diferentes valoraciones
- Antigüedad: Propiedades más nuevas suelen tener mayor valor
- Ubicación: Dirección específica, accesibilidad, infraestructura local
- Superficie: Metros cubiertos vs descubiertos
- Características: Ambientes, baños, amenities especiales

**CÁLCULO DE ALQUILER:**
- Para propiedades RESIDENCIALES (casa, departamento, PH): 5% del valor mensual (5% anual / 12)
- Para propiedades COMERCIALES (local, oficina): 6% del valor mensual (6% anual / 12)
- Ejemplo: Propiedad con valor $150,000 USD → Alquiler residencial = $150,000 × 0.05 / 12 = $625 USD/mes

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
  "alquilerMensualPromedio": <número USD>,
  "analisis": "<explicación detallada del rango de valuación y alquiler>",
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

  const isCommercial = tipoPropiedad && ['local', 'oficina'].includes(tipoPropiedad.toLowerCase());
  const rentalPercentage = isCommercial ? 6 : 5;

  return `Por favor, valúa la siguiente propiedad y proporciona una estimación de valor en USD Y cálculo de alquiler mensual.

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

**INSTRUCCIONES PARA CÁLCULO DE ALQUILER:**
Calcula el alquiler mensual estimado como ${rentalPercentage}% del valor de compraventa anual (${rentalPercentage}% / 12).
Ejemplo: Si el valor es $150,000 USD, el alquiler = $150,000 × ${rentalPercentage}% / 12 = $${(150000 * rentalPercentage / 100 / 12).toFixed(0)} USD/mes

Proporciona:
1. Rango de valuación realista en dólares USD
2. Cálculo de alquiler mensual en USD (${rentalPercentage}% anual / 12 meses)
3. Análisis detallado de ambos valores`;
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

    // Procesar alquiler
    let valorAlquilerUSD = null;
    let valorAlquilerARS = null;
    let porcentajeAlquiler = null;

    if (aiResponseData.alquilerMensualPromedio) {
      valorAlquilerUSD = parseFloat(aiResponseData.alquilerMensualPromedio);
      
      if (!isNaN(valorAlquilerUSD)) {
        // Obtener cotización USD/ARS
        const cotizacionUSD = await getUSDARSRate();
        valorAlquilerARS = valorAlquilerUSD * cotizacionUSD;
        
        // Determinar porcentaje usado (5% residencial, 6% comercial)
        const isCommercial = propertyData.tipoPropiedad && 
          ['local', 'oficina'].includes(propertyData.tipoPropiedad.toLowerCase());
        porcentajeAlquiler = isCommercial ? 6 : 5;
        
        console.log(`[VALUATION] Alquiler calculado: USD ${valorAlquilerUSD.toFixed(2)}, ARS ${valorAlquilerARS.toFixed(2)} (cotización: ${cotizacionUSD})`);
      }
    } else {
      // Fallback: calcular automáticamente si la IA no devuelve alquiler
      const isCommercial = propertyData.tipoPropiedad && 
        ['local', 'oficina'].includes(propertyData.tipoPropiedad.toLowerCase());
      const percentage = isCommercial ? 6 : 5;
      const promedioValor = (valorMinimo + valorMaximo) / 2;
      
      valorAlquilerUSD = (promedioValor * percentage / 100) / 12;
      
      const cotizacionUSD = await getUSDARSRate();
      valorAlquilerARS = valorAlquilerUSD * cotizacionUSD;
      porcentajeAlquiler = percentage;
      
      console.log(`[VALUATION] Alquiler calculado por fallback: USD ${valorAlquilerUSD.toFixed(2)}, ARS ${valorAlquilerARS.toFixed(2)}`);
    }

    // Guardar en base de datos
    const valuation = await prisma.valuation.create({
      data: {
        ...propertyData,
        valorMinimo,
        valorMaximo,
        valorAlquilerUSD,
        valorAlquilerARS,
        porcentajeAlquiler,
        analisisIA: JSON.stringify(aiResponseData),
        userId,
      },
    });

    res.json({
      success: true,
      id: valuation.id,
      valorMinimo: valuation.valorMinimo,
      valorMaximo: valuation.valorMaximo,
      valorAlquilerUSD: valuation.valorAlquilerUSD,
      valorAlquilerARS: valuation.valorAlquilerARS,
      porcentajeAlquiler: valuation.porcentajeAlquiler,
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
        valorAlquilerUSD: true,
        valorAlquilerARS: true,
        porcentajeAlquiler: true,
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

/**
 * Enviar valuación por email
 */
const sendValuationEmail = async (req, res) => {
  try {
    const { recipientEmail, valuationData, metrosCubiertos, ambientes, banos } = req.body;

    if (!recipientEmail || !valuationData) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (recipientEmail, valuationData)'
      });
    }

    // Validar que sea un email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Solo usuarios autenticados pueden enviar
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      });
    }

    // Enviar email con valuación
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'info@rialtor.app',
        pass: process.env.SMTP_PASS,
      }
    });

    // Formatear los datos de la valuación en HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Tasación de Propiedad</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Rialtor.app - Herramientas para Agentes Inmobiliarios</p>
        </div>

        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <h2 style="color: #1f2937; margin-top: 0;">Resumen de Tasación</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h3 style="color: #7c3aed; margin-top: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Ubicación</h3>
            <p style="margin: 0; font-size: 16px; font-weight: bold;">${valuationData.localidad}, ${valuationData.provincia}</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Valor Mínimo</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #7c3aed;">$${valuationData.valorMinimo.toLocaleString('es-AR')}</p>
              <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">USD</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Valor Máximo</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ec4899;">$${valuationData.valorMaximo.toLocaleString('es-AR')}</p>
              <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">USD</p>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h3 style="color: #374151; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Características del Inmueble</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">Ambientes</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${ambientes}</p>
              </div>
              <div>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">Baños</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${banos}</p>
              </div>
              <div>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px;">M² Cubiertos</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${metrosCubiertos}</p>
              </div>
            </div>
          </div>

          ${valuationData.valorAlquilerUSD ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Alquiler Mensual (USD)</p>
                <p style="margin: 0; font-size: 20px; font-weight: bold; color: #10b981;">$${valuationData.valorAlquilerUSD.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #06b6d4;">
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Alquiler Mensual (ARS)</p>
                <p style="margin: 0; font-size: 20px; font-weight: bold; color: #06b6d4;">$${valuationData.valorAlquilerARS?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          ` : ''}

          ${valuationData.analisis ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
              <h4 style="color: #374151; margin-top: 0; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Análisis</h4>
              <p style="margin: 0; color: #6b7280; line-height: 1.8; font-size: 14px;">${valuationData.analisis}</p>
            </div>
          ` : ''}

          ${valuationData.factoresConsiderados && valuationData.factoresConsiderados.length > 0 ? `
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h4 style="color: #374151; margin-top: 0; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Factores Considerados</h4>
              <ul style="margin: 0; padding-left: 20px;">
                ${valuationData.factoresConsiderados.map(factor => `
                  <li style="margin: 10px 0; color: #6b7280; font-size: 14px;">${factor}</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; font-size: 12px;">
            <strong>www.rialtor.app</strong><br>
            Herramientas Profesionales para Agentes Inmobiliarios
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'info@rialtor.app',
      to: recipientEmail,
      subject: `Tasación de Propiedad - ${valuationData.localidad}, ${valuationData.provincia} - Rialtor`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`[VALUATION] Email sent to ${recipientEmail}. Message ID: ${info.messageId}`);

    res.json({
      success: true,
      message: 'Valuación enviada correctamente',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('[VALUATION] Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el email',
      error: error.message
    });
  }
};

module.exports = {
  createValuation,
  getValuations,
  getValuationById,
  deleteValuation,
  sendValuationEmail,
};
