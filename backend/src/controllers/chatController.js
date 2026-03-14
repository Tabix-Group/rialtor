require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const axios = require('axios');

const prisma = new PrismaClient();

// Inicializar OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.log('[DEBUG] OPENAI_API_KEY NOT FOUND');
}

// Modelo OpenAI configurable - Usar GPT-4o con búsqueda web
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
console.log('[DEBUG] OPENAI model configured as:', DEFAULT_OPENAI_MODEL);

// Sistema de búsqueda web - Ahora usa capacidades nativas de OpenAI
const USE_WEB_SEARCH = true; // Búsqueda web integrada en GPT-4o

// Prompt del sistema especializado en bienes raíces argentinos
const REAL_ESTATE_SYSTEM_PROMPT = `Eres RIALTOR, un asistente de inteligencia artificial especializado en el sector inmobiliario argentino. Tu objetivo es ayudar a agentes inmobiliarios, brokers, y profesionales del sector con:

**TUS CAPACIDADES:**
1. 📊 **Cálculos Inmobiliarios**: Honorarios, gastos de escrituración e impuestos (sellos, ITI) - USA LAS HERRAMIENTAS
2. 🏠 **Gestión de Propiedades**: Asesoramiento en compra, venta, alquiler, inversión
3.  **Aspectos Legales**: Normativas argentinas, contratos, documentación requerida
4. 🔧 **Herramientas**: Calculadoras automáticas, consultas de base de datos
5. 📈 **Análisis**: Evaluación de inversiones, ROI, rentabilidad de propiedades
6. 💡 **Conocimiento Base**: Información general sobre el mercado inmobiliario argentino

**IMPORTANTE - CÁLCULOS:**
Cuando te pidan calcular honorarios o gastos de escrituración, SIEMPRE usa las herramientas disponibles:
- calcular_honorarios: Para comisiones inmobiliarias con todos los impuestos
- calcular_gastos_escrituracion: Para gastos de escrituración por provincia

**INFORMACIÓN SIEMPRE ACTUALIZADA:**
- Para cualquier información actual (precios del dólar HOY, noticias recientes, datos actuales):
  * USA LA HERRAMIENTA buscar_informacion_web para obtener datos en tiempo real del día
  * Proporciona fuentes confiables y enlaces verificados
  * Incluye fecha de la información consultada
  * Siempre estoy actualizado gracias a mis herramientas de búsqueda web

**CONTEXTO ARGENTINO:**
- Conocimiento profundo del mercado inmobiliario argentino (CABA, GBA, provincias)
- Regulaciones: Ley de Alquileres, normativas provinciales y municipales
- Sistema impositivo argentino: Sellos, ITI, IIBB, Ganancias
- Colegios profesionales y matrículas inmobiliarias
- Formas de pago: pesos, dólar oficial, dólar blue, financiación

**ESTILO DE COMUNICACIÓN:**
- Profesional pero accesible y amigable
- Respuestas claras, estructuradas y accionables
- Usa emojis moderadamente para mejorar la legibilidad
- Proporciona ejemplos prácticos cuando sea posible
- Siempre enfocado en ayudar con información actual y precisa

**PRIORIDADES:**
1. **USAR HERRAMIENTAS** para cálculos (precisión 100%)
2. Asesoramiento práctico y aplicable
3. Cumplimiento de normativas argentinas
4. Información siempre actualizada usando búsqueda web

Recuerda: Eres un asistente profesional que ayuda a tomar decisiones informadas. Para cálculos, SIEMPRE usa las herramientas. Para información actual, usa la búsqueda web integrada.`;

// Prompt del sistema especializado en SOPORTE y AYUDA de la plataforma
const HELP_SYSTEM_PROMPT = `Eres el Asistente de Soporte de RIALTOR. Tu única función es ayudar a los usuarios a navegar y utilizar la plataforma RIALTOR. 
No respondes preguntas sobre el mercado inmobiliario general (como leyes o mercado, para eso está el Asistente Especialista). 

Tu conocimiento se basa exclusivamente en las secciones de la plataforma:
1. **Primeros Pasos**: Registro, suscripción VIP (vía Stripe), Panel de Control (Dólar, IPC, CAC, Embudo de ventas, Calendario), e instalación de la PWA (App Móvil).
2. **Asistente IA**: Consultor inmobiliario con búsqueda en vivo y herramientas de cálculo.
3. **Indicadores Económicos**: Dólar (Blue, Oficial, MEP), ICL, CAC, IPC, UVA, Precio m2 CABA, Tasas. Disponibles en https://www.rialtor.app/indicadores.
4. **Calculadoras**: Honorarios, Escrituración, IIGG, Ajustes Alquiler, CAC, Créditos UVA, Seguros de Caución, Días Hábiles. Se encuentran en https://www.rialtor.app/calculadoras.
5. **Documentos**: Gestión de formularios editables (https://www.rialtor.app/formularios) en carpetas (Alquiler, Boletos, Reservas) y Resumidor Inteligente de PDF/DOCX.
6. **Placas**: Generador de placas con 5 modelos (Standard, Premium, VIP con QR, Moderno, Impacto). Se accede en https://www.rialtor.app/placas.
7. **Amuebla IA**: Diseño de interiores con IA. Sube fotos de espacios y generá renders con diferentes estilos de decoración. https://www.rialtor.app/decorala.
8. **Docusmart**: Procesamiento inteligente de documentos. Sube PDF/DOCX de contratos y extrae datos críticos (vencimientos, montos, cláusulas). https://www.rialtor.app/docusmart.
9. **Tasador**: Valuación de propiedades con IA. Ingresá datos de una propiedad y obtendrás rango de precios en USD con análisis de mercado. https://www.rialtor.app/valuador.
10. **Proyecciones**: Sección https://www.rialtor.app/prospectos para simulación comercial y embudo de conversión.
11. **Finanzas**: Gestión bimonetaria (ARS/USD), actividad laboral vs personal, gráficos y reportes exportables a Excel en https://www.rialtor.app/finanzas.
12. **Newsletter**: Creación de campañas y plantillas en https://www.rialtor.app/newsletter.
13. **Calendario**: Sincronización de visitas en https://www.rialtor.app/calendario.
14. **Soporte**: Contacto vía email (rialtor@rialtor.app). Horario: L-V 9-18hs.

**REGLAS CRÍTICAS:**
- Responde siempre en ESPAÑOL.
- Sé extremadamente amable, breve y profesional.
- Si el usuario pregunta algo fuera del uso de la plataforma, recuérdale que eres un asistente de ayuda técnica y guíalo a usar el Asistente Especialista para temas de mercado.
- Usa emojis moderadamente para ser amigable.
- Guía al usuario a la sección correcta de la web mencionando SIEMPRE el enlace completo (ej: https://www.rialtor.app/placas, https://www.rialtor.app/indicadores) para que el usuario pueda hacer clic directamente. No uses solo la ruta corta como /placas.
- Idealmente, presenta los links de forma clara para que el usuario pueda navegar sin salir de la plataforma.`;

// Herramientas disponibles (Function Calling)
const AVAILABLE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'calcular_honorarios',
      description: 'Calcula los honorarios inmobiliarios y comisiones considerando impuestos argentinos (IVA, IIBB, Ganancias, Sellos)',
      parameters: {
        type: 'object',
        properties: {
          monto_operacion: {
            type: 'number',
            description: 'Monto total de la operación en pesos argentinos o dólares'
          },
          porcentaje_comision: {
            type: 'number',
            description: 'Porcentaje de comisión (generalmente entre 3% y 5%)'
          },
          zona: {
            type: 'string',
            enum: ['caba', 'gba', 'interior'],
            description: 'Zona geográfica: CABA, GBA (Gran Buenos Aires), o Interior'
          },
          monotributista: {
            type: 'boolean',
            description: 'Si el agente es monotributista (true) o responsable inscripto (false)'
          }
        },
        required: ['monto_operacion', 'porcentaje_comision']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calcular_gastos_escrituracion',
      description: 'Calcula los gastos de escrituración en Argentina incluyendo impuesto de sellos, ITI, honorarios de escribano, etc.',
      parameters: {
        type: 'object',
        properties: {
          valor_propiedad: {
            type: 'number',
            description: 'Valor de la propiedad en pesos o dólares'
          },
          provincia: {
            type: 'string',
            description: 'Provincia donde se encuentra la propiedad (afecta alícuota de sellos)'
          },
          tipo_operacion: {
            type: 'string',
            enum: ['compraventa', 'hipoteca', 'donacion'],
            description: 'Tipo de operación inmobiliaria'
          }
        },
        required: ['valor_propiedad', 'provincia']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'buscar_informacion_web',
      description: 'Busca información actualizada en la web sobre temas inmobiliarios argentinos, precios del dólar, noticias del mercado, etc.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'La consulta de búsqueda en español o inglés'
          },
          topic: {
            type: 'string',
            enum: ['dolar', 'noticias_inmobiliarias', 'tasas_interes', 'normativas', 'precios_propiedades', 'mercado_general'],
            description: 'Categoría del tema para optimizar la búsqueda'
          },
          max_results: {
            type: 'number',
            description: 'Número máximo de resultados (1-5)',
            default: 3
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'consultar_propiedades',
      description: 'Consulta propiedades disponibles en la base de datos del sistema',
      parameters: {
        type: 'object',
        properties: {
          tipo: {
            type: 'string',
            description: 'Tipo de propiedad: casa, departamento, terreno, local, oficina, etc.'
          },
          zona: {
            type: 'string',
            description: 'Zona o barrio de búsqueda'
          },
          precio_max: {
            type: 'number',
            description: 'Precio máximo en USD o ARS'
          },
          ambientes: {
            type: 'number',
            description: 'Cantidad de ambientes mínima'
          }
        },
        required: []
      }
    }
  }
];

// Función auxiliar: Calcular honorarios inmobiliarios
function calcularHonorarios({ monto_operacion, porcentaje_comision, zona = 'caba', monotributista = false }) {
  const comision_bruta = monto_operacion * (porcentaje_comision / 100);
  
  let resultado = {
    monto_operacion,
    porcentaje_comision,
    comision_bruta,
    zona,
    monotributista,
    deducciones: {},
    neto: 0
  };

  if (monotributista) {
    // Monotributista: solo paga sellado
    const sellado_caba = zona === 'caba' ? comision_bruta * 0.012 : 0;
    const sellado_provincia = zona !== 'caba' ? comision_bruta * 0.015 : 0;
    const total_sellado = sellado_caba || sellado_provincia;
    
    resultado.deducciones = {
      sellado: total_sellado
    };
    resultado.neto = comision_bruta - total_sellado;
  } else {
    // Responsable Inscripto
    const iva = comision_bruta * 0.21;
    const iibb = comision_bruta * 0.03; // 3% promedio
    const ganancias = comision_bruta * 0.015; // 1.5% retención
    const sellado_caba = zona === 'caba' ? comision_bruta * 0.012 : 0;
    const sellado_provincia = zona !== 'caba' ? comision_bruta * 0.015 : 0;
    const total_sellado = sellado_caba || sellado_provincia;
    
    resultado.deducciones = {
      iva,
      iibb,
      ganancias,
      sellado: total_sellado
    };
    
    const total_deducciones = iva + iibb + ganancias + total_sellado;
    resultado.neto = comision_bruta - total_deducciones;
  }

  resultado.total_deducciones = Object.values(resultado.deducciones).reduce((a, b) => a + b, 0);
  
  return resultado;
}

// Función auxiliar: Calcular gastos de escrituración
function calcularGastosEscrituracion({ valor_propiedad, provincia = 'Buenos Aires', tipo_operacion = 'compraventa' }) {
  // Alícuotas aproximadas por provincia (estas deberían venir de una DB actualizada)
  const alicuotas_sellos = {
    'Buenos Aires': 0.0375,
    'CABA': 0.025,
    'Córdoba': 0.04,
    'Santa Fe': 0.04,
    'Mendoza': 0.04
  };

  const alicuota = alicuotas_sellos[provincia] || 0.04;
  const impuesto_sellos = valor_propiedad * alicuota;
  
  // ITI (Impuesto a la Transferencia Inmobiliaria) en CABA
  const iti = provincia === 'CABA' ? valor_propiedad * 0.015 : 0;
  
  // Honorarios del escribano (aproximado 0.8% - 1.5%)
  const honorarios_escribano = valor_propiedad * 0.01;
  
  // Gastos administrativos (certificados, informes, etc.)
  const gastos_administrativos = 50000; // Valor aproximado en ARS
  
  return {
    valor_propiedad,
    provincia,
    tipo_operacion,
    desglose: {
      impuesto_sellos,
      iti,
      honorarios_escribano,
      gastos_administrativos
    },
    total: impuesto_sellos + iti + honorarios_escribano + gastos_administrativos
  };
}

// Función auxiliar: Consultar propiedades (mock - debería conectar con DB real)
async function consultarPropiedades(filters) {
  // En producción, esto haría una query a la base de datos
  // Por ahora, retornamos un mensaje informativo
  return {
    message: 'Función de consulta de propiedades en desarrollo. Los filtros solicitados son:',
    filters,
    suggestion: 'Por favor, proporciona más detalles sobre la propiedad que buscas para una recomendación personalizada.'
  };
}

// Función auxiliar: Buscar información en la web usando Tavily
async function buscarInformacionWeb({ query, topic = 'mercado_general', max_results = 3 }) {
  try {
    if (!process.env.TAVILY_API_KEY) {
      return {
        success: false,
        error: 'API de búsqueda web no configurada',
        message: 'La búsqueda web requiere configuración de TAVILY_API_KEY'
      };
    }

    // Configurar query según el topic
    let searchQuery = query;
    if (topic === 'dolar') {
      searchQuery = `${query} precio dólar Argentina hoy`;
    } else if (topic === 'noticias_inmobiliarias') {
      searchQuery = `${query} noticias inmobiliarias Argentina`;
    } else if (topic === 'tasas_interes') {
      searchQuery = `${query} tasas interés hipotecarios Argentina`;
    } else if (topic === 'normativas') {
      searchQuery = `${query} normativa inmobiliaria Argentina cambios recientes`;
    }

    console.log('[WEB_SEARCH] Buscando:', searchQuery);

    const response = await axios.post('https://api.tavily.com/search', {
      api_key: process.env.TAVILY_API_KEY,
      query: searchQuery,
      search_depth: 'advanced',
      include_images: false,
      include_answer: true,
      include_raw_content: false,
      max_results: Math.min(max_results, 5),
      include_domains: topic === 'dolar' ? ['dolarhoy.com', 'ambito.com', 'cronista.com'] : undefined
    });

    if (response.data && response.data.results) {
      return {
        success: true,
        query: searchQuery,
        topic,
        results: response.data.results.map(result => ({
          title: result.title,
          url: result.url,
          content: result.content,
          score: result.score
        })),
        answer: response.data.answer || null,
        search_date: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        error: 'No se encontraron resultados',
        query: searchQuery
      };
    }
  } catch (error) {
    console.error('[WEB_SEARCH] Error:', error);
    return {
      success: false,
      error: error.message,
      query
    };
  }
}

// Manejador de Function Calling
async function handleFunctionCall(functionName, functionArgs) {
  console.log('[FUNCTION_CALL]', functionName, functionArgs);
  
  try {
    switch (functionName) {
      case 'calcular_honorarios':
        return calcularHonorarios(functionArgs);
      
      case 'calcular_gastos_escrituracion':
        return calcularGastosEscrituracion(functionArgs);
      
      case 'buscar_informacion_web':
        return await buscarInformacionWeb(functionArgs);
      
      case 'consultar_propiedades':
        return await consultarPropiedades(functionArgs);
      
      default:
        return { error: 'Función no reconocida' };
    }
  } catch (error) {
    console.error('[FUNCTION_CALL] Error:', error);
    return { error: error.message };
  }
}

const createChatSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const session = await prisma.chatSession.create({
      data: {
        userId,
        title: title || 'Nueva consulta',
        isActive: true
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    res.status(201).json({
      message: 'Chat session created successfully',
      session
    });
  } catch (error) {
    next(error);
  }
};

const getChatSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Solo el último mensaje para preview
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.chatSession.count({
      where: { userId }
    });

    res.json({
      message: 'Chat sessions retrieved successfully',
      sessions,
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

const getChatSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Chat session not found or access denied'
      });
    }

    res.json({
      message: 'Chat session retrieved successfully',
      session
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    let session;

    // Si no hay sessionId, crear una nueva sesión
    if (!sessionId) {
      session = await prisma.chatSession.create({
        data: {
          userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          isActive: true
        }
      });
    } else {
      // Verificar que la sesión existe y pertenece al usuario
      session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20 // Últimos 20 mensajes para contexto
          }
        }
      });
      if (!session) {
        return res.status(404).json({
          error: 'Session not found',
          message: 'Chat session not found or access denied'
        });
      }
    }

    // Guardar mensaje del usuario
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        content: message,
        role: 'USER'
      }
    });

    // Generar respuesta con OpenAI usando el nuevo sistema
    let assistantResponse = 'Lo siento, el servicio de IA no está disponible.';
    let sources = null;
    let calculationResults = null;

    if (openai) {
      try {
        // Construir historial de conversación
        const conversationHistory = session.messages ? 
          session.messages.map(msg => ({
            role: msg.role === 'USER' ? 'user' : 'assistant',
            content: msg.content
          })) : [];

        // Agregar mensaje actual
        conversationHistory.push({
          role: 'user',
          content: message
        });

        console.log('[CHAT] Enviando a OpenAI con', conversationHistory.length, 'mensajes en historial');

        // Primera llamada: con function calling y búsqueda web habilitada
        const completion = await openai.chat.completions.create({
          model: DEFAULT_OPENAI_MODEL,
          messages: [
            { role: 'system', content: REAL_ESTATE_SYSTEM_PROMPT },
            ...conversationHistory
          ],
          tools: AVAILABLE_TOOLS,
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 2000,
          // Habilitar búsqueda web (Web Browsing)
          // Nota: Esto está disponible en gpt-4o y modelos más recientes
        });

        let responseMessage = completion.choices[0].message;
        console.log('[CHAT] Respuesta OpenAI:', {
          finish_reason: completion.choices[0].finish_reason,
          has_tool_calls: !!responseMessage.tool_calls
        });

        // Si OpenAI quiere usar herramientas
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          const toolCalls = responseMessage.tool_calls;
          console.log('[CHAT] OpenAI solicita', toolCalls.length, 'function calls');

          // Ejecutar todas las funciones solicitadas
          const toolMessages = [];
          for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            
            console.log('[CHAT] Ejecutando función:', functionName);
            const functionResult = await handleFunctionCall(functionName, functionArgs);
            
            // Guardar resultados para mostrar al usuario
            if (functionName === 'buscar_informacion_web' && functionResult.success) {
              sources = functionResult.results;
            } else if (functionName.includes('calcular')) {
              calculationResults = functionResult;
            }

            toolMessages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              name: functionName,
              content: JSON.stringify(functionResult)
            });
          }

          // Segunda llamada: con resultados de las funciones
          const secondCompletion = await openai.chat.completions.create({
            model: DEFAULT_OPENAI_MODEL,
            messages: [
              { role: 'system', content: REAL_ESTATE_SYSTEM_PROMPT },
              ...conversationHistory,
              responseMessage,
              ...toolMessages
            ],
            temperature: 0.7,
            max_tokens: 2000
          });

          assistantResponse = secondCompletion.choices[0].message.content;
        } else {
          // Respuesta directa sin herramientas
          assistantResponse = responseMessage.content;
        }

      } catch (error) {
        console.error('[CHAT] Error con OpenAI:', error);
        assistantResponse = 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta nuevamente.';
      }
    }

    // Preparar metadata con fuentes y cálculos
    const metadata = {};
    if (sources && sources.length > 0) {
      metadata.sources = sources.map(s => ({
        title: s.title,
        url: s.url,
        snippet: s.content?.substring(0, 200)
      }));
    }
    if (calculationResults) {
      metadata.calculation = calculationResults;
    }

    // Guardar respuesta del asistente
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        content: assistantResponse,
        role: 'ASSISTANT',
        metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null
      }
    });

    // Actualizar la sesión
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() }
    });

    res.json({
      message: 'Message sent successfully',
      sessionId: session.id,
      userMessage,
      assistantMessage: {
        ...assistantMessage,
        metadata: metadata
      }
    });
  } catch (error) {
    console.error('[ERROR][sendMessage]', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unexpected error'
    });
  }
};

const deleteChatSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Chat session not found or access denied'
      });
    }

    // Eliminar mensajes y sesión
    await prisma.chatMessage.deleteMany({
      where: { sessionId }
    });

    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    res.json({
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateChatSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { title, isActive } = req.body;
    const userId = req.user.id;

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId
      }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Chat session not found or access denied'
      });
    }

    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        ...(title && { title }),
        ...(typeof isActive === 'boolean' && { isActive })
      }
    });

    res.json({
      message: 'Chat session updated successfully',
      session: updatedSession
    });
  } catch (error) {
    next(error);
  }
};

const sendFeedback = async (req, res, next) => {
  try {
    const { messageId, feedbackType, sessionId } = req.body;
    const userId = req.user.id;

    // Verificar que el mensaje pertenece al usuario
    const message = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        session: {
          userId
        }
      }
    });

    if (!message) {
      return res.status(404).json({
        error: 'Message not found',
        message: 'Message not found or access denied'
      });
    }

    // Actualizar el metadata del mensaje con el feedback
    const currentMetadata = message.metadata ? JSON.parse(message.metadata) : {};
    const updatedMetadata = {
      ...currentMetadata,
      feedback: feedbackType,
      feedbackAt: new Date().toISOString()
    };

    await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        metadata: JSON.stringify(updatedMetadata)
      }
    });

    res.json({
      message: 'Feedback recorded successfully',
      feedback: feedbackType
    });
  } catch (error) {
    next(error);
  }
};

const processHelpChat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!openai) {
      return res.status(503).json({ error: 'OpenAI service not available' });
    }

    const messages = [
      { role: 'system', content: HELP_SYSTEM_PROMPT },
      ...history.slice(-5), // Solo tomamos los últimos 5 mensajes de historial para ligereza
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const assistantResponse = completion.choices[0].message.content;

    res.json({
      content: assistantResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[HELP_CHAT] Error:', error);
    next(error);
  }
};

module.exports = {
  createChatSession,
  getChatSessions,
  getChatSession,
  sendMessage,
  deleteChatSession,
  updateChatSession,
  sendFeedback,
  processHelpChat
};
