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

// Modelo OpenAI configurable - Usar GPT-4 para mejor capacidad
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
console.log('[DEBUG] OPENAI model configured as:', DEFAULT_OPENAI_MODEL);

// Sistema de búsqueda web (Tavily API)
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const USE_WEB_SEARCH = TAVILY_API_KEY ? true : false;

// Prompt del sistema especializado en bienes raíces argentinos
const REAL_ESTATE_SYSTEM_PROMPT = `Eres RIALTOR, un asistente de inteligencia artificial especializado en el sector inmobiliario argentino. Tu objetivo es ayudar a agentes inmobiliarios, brokers, y profesionales del sector con:

**TUS CAPACIDADES:**
1. 📊 **Cálculos Inmobiliarios**: Honorarios, gastos de escrituración, impuestos (sellos, ITI), tasaciones
2. 🏠 **Gestión de Propiedades**: Asesoramiento en compra, venta, alquiler, inversión
3. 💰 **Información de Mercado**: Precios actuales del dólar (blue, oficial, MEP), tendencias del mercado
4. 📋 **Aspectos Legales**: Normativas argentinas, contratos, documentación requerida
5. 🔧 **Herramientas**: Acceso a calculadoras, generación de documentos, consultas de base de datos
6. 📈 **Análisis**: Evaluación de inversiones, ROI, rentabilidad de propiedades

**CONTEXTO ARGENTINO:**
- Conocimiento profundo del mercado inmobiliario argentino (CABA, GBA, provincias)
- Regulaciones locales: Ley de Alquileres, normativas provinciales y municipales
- Sistema impositivo argentino: Sellos, ITI, IIBB, Ganancias
- Colegios profesionales y matrículas inmobiliarias
- Formas de pago: pesos, dólar oficial, dólar blue, financiación

**ESTILO DE COMUNICACIÓN:**
- Profesional pero accesible y amigable
- Respuestas claras, estructuradas y accionables
- Usa emojis moderadamente para mejorar la legibilidad
- Proporciona ejemplos prácticos cuando sea posible
- Cita fuentes cuando uses información externa o en tiempo real

**CUANDO NO SEPAS ALGO:**
- Sé honesto sobre las limitaciones
- Sugiere dónde obtener información precisa
- Recomienda consultar con profesionales específicos cuando sea necesario

**PRIORIDADES:**
1. Precisión en cálculos y datos legales
2. Información actualizada del mercado
3. Asesoramiento práctico y aplicable
4. Cumplimiento de normativas argentinas

Recuerda: Eres un asistente profesional que ayuda a tomar decisiones informadas, pero siempre recomienda verificar información crítica con profesionales certificados (escribanos, contadores, abogados).`;

// Herramientas disponibles (Function Calling)
const AVAILABLE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'buscar_informacion_web',
      description: 'Busca información actualizada en internet sobre precios del dólar, noticias inmobiliarias, tendencias del mercado, regulaciones, o cualquier información en tiempo real que necesites.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'La consulta de búsqueda. Ejemplos: "precio dólar blue hoy argentina", "nuevas regulaciones alquileres argentina 2024", "precio m2 palermo buenos aires"'
          },
          max_results: {
            type: 'number',
            description: 'Número máximo de resultados a retornar (default: 5)',
            default: 5
          }
        },
        required: ['query']
      }
    }
  },
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

// Función auxiliar: Búsqueda web con Tavily
async function searchWeb(query, maxResults = 5) {
  if (!TAVILY_API_KEY) {
    return {
      success: false,
      error: 'Web search not configured',
      results: []
    };
  }

  try {
    console.log('[WEB_SEARCH] Buscando:', query);
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: TAVILY_API_KEY,
      query: query,
      search_depth: 'basic',
      include_answer: true,
      include_domains: [],
      exclude_domains: [],
      max_results: maxResults
    });

    const data = response.data;
    console.log('[WEB_SEARCH] Resultados obtenidos:', data.results?.length || 0);

    return {
      success: true,
      answer: data.answer,
      results: data.results || [],
      query: query
    };
  } catch (error) {
    console.error('[WEB_SEARCH] Error:', error.message);
    return {
      success: false,
      error: error.message,
      results: []
    };
  }
}

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

// Manejador de Function Calling
async function handleFunctionCall(functionName, functionArgs) {
  console.log('[FUNCTION_CALL]', functionName, functionArgs);
  
  try {
    switch (functionName) {
      case 'buscar_informacion_web':
        return await searchWeb(functionArgs.query, functionArgs.max_results || 5);
      
      case 'calcular_honorarios':
        return calcularHonorarios(functionArgs);
      
      case 'calcular_gastos_escrituracion':
        return calcularGastosEscrituracion(functionArgs);
      
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

        // Primera llamada: con function calling
        const completion = await openai.chat.completions.create({
          model: DEFAULT_OPENAI_MODEL,
          messages: [
            { role: 'system', content: REAL_ESTATE_SYSTEM_PROMPT },
            ...conversationHistory
          ],
          tools: AVAILABLE_TOOLS,
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 2000
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

module.exports = {
  createChatSession,
  getChatSessions,
  getChatSession,
  sendMessage,
  deleteChatSession,
  updateChatSession,
  sendFeedback
};
