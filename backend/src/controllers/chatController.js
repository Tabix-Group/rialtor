require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();

// Inicializar OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY) {
  // Log para debug: mostrar parte de la key (no toda por seguridad)
  const key = process.env.OPENAI_API_KEY;
  const safeKey = key.length > 8 ? key.substring(0, 4) + '...' + key.substring(key.length - 4) : key;
  console.log('[DEBUG] OPENAI_API_KEY detected:', safeKey);
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.log('[DEBUG] OPENAI_API_KEY NOT FOUND');
}

// Modelo OpenAI configurable por variable de entorno. Usa GPT-4o por defecto (último modelo)
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
console.log('[DEBUG] OPENAI model configured as:', DEFAULT_OPENAI_MODEL);

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

const { kb_lookup, tasador_express, calc_gastos_escritura, calc_honorarios } = require('../services/rialtorTools');
const { saveSlots, getSlots } = require('../services/sessionStore');
const fs = require('fs');
const os = require('os');
const path = require('path');
const metrics = require('../instrumentation/rialtorMetrics');
const templates = require('../templates/rialtorTemplates');

const sendMessage = async (req, res, next) => {
  try {
    console.log('[CHAT] sendMessage called');
    console.log('[CHAT] req.body:', JSON.stringify(req.body, null, 2));
    let { message, sessionId, audioBase64, audioFilename } = req.body;
    const userId = req.user.id;
    console.log('[CHAT] userId:', userId, 'sessionId:', sessionId, 'message:', message);
    console.log('[CHAT] message type:', typeof message, 'sessionId type:', typeof sessionId);

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
      console.log('[CHAT] Nueva sesión creada:', session.id);
    } else {
      // Verificar que la sesión existe y pertenece al usuario
      session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId
        }
      });
      if (!session) {
        console.log('[CHAT] Sesión no encontrada o acceso denegado:', sessionId);
        return res.status(404).json({
          error: 'Session not found',
          message: 'Chat session not found or access denied'
        });
      }
      console.log('[CHAT] Sesión encontrada:', session.id);
    }

    // Si viene audio en base64, decodificar y transcribir antes de guardar
    if (audioBase64) {
      if (!openai) {
        console.log('[CHAT] OpenAI no inicializado para transcripción');
        return res.status(503).json({ error: 'El servicio de IA no está disponible temporalmente.' });
      }
      try {
        const buffer = Buffer.from(audioBase64, 'base64');
        const tmpDir = os.tmpdir();
        const safeName = (audioFilename && path.basename(audioFilename)) || `audio-${Date.now()}.webm`;
        const tmpPath = path.join(tmpDir, `${Date.now()}-${safeName}`);
        fs.writeFileSync(tmpPath, buffer);
        console.log('[CHAT] Audio guardado temporalmente en:', tmpPath);

        // Llamada a la API de transcripción de OpenAI (modelo whisper-1)
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tmpPath),
          model: 'whisper-1'
        });

        if (transcription && transcription.text) {
          message = transcription.text;
          console.log('[CHAT] Transcripción obtenida:', message.substring(0, 200));
        } else if (transcription && transcription.data && transcription.data[0] && transcription.data[0].text) {
          // fallback structure
          message = transcription.data[0].text;
          console.log('[CHAT] Transcripción (fallback) obtenida:', message.substring(0, 200));
        } else {
          console.log('[CHAT] No se obtuvo texto de la transcripción');
        }

        // eliminar archivo temporal
        try { fs.unlinkSync(tmpPath); } catch (e) { /* ignore */ }
      } catch (tErr) {
        console.warn('[CHAT] Error transcribiendo audio:', tErr.message);
      }
    }

    // Guardar mensaje del usuario (texto o transcripción)
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        content: message,
        role: 'USER'
      }
    });
    console.log('[CHAT] Mensaje de usuario guardado:', userMessage.id);

    // Buscar contexto relevante en artículos y documentos (mantener lógica existente)
    let contextText = '';
    let foundContext = false;

    // Buscar artículos relevantes
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: message, mode: 'insensitive' } },
          { content: { contains: message, mode: 'insensitive' } },
          { excerpt: { contains: message, mode: 'insensitive' } }
        ]
      },
      include: { category: true },
      take: 3,
      orderBy: { views: 'desc' }
    });
    console.log('[CHAT] Artículos encontrados:', articles.length);

    if (articles.length > 0) {
      foundContext = true;
      contextText += 'Artículos relevantes:\n';
      articles.forEach((a, idx) => {
        let slug = a.slug;
        let title = a.title || a.name || '';
        let excerpt = a.excerpt || a.summary || '';
        let content = a.content || a.text || '';
        let category = (a.category && a.category.name) || a.category || 'Sin categoría';
        if (!slug && a.id) {
          slug = a.id;
        }
        const baseUrl = process.env.FRONTEND_URL || 'https://remax.tabix.com.ar';
        const articleUrl = slug ? `${baseUrl}/knowledge/article/${slug}` : '';
        contextText += `(${idx + 1}) Título: ${title}\nResumen: ${excerpt}\nContenido: ${content.substring(0, 800)}\nCategoría: ${category}\nEnlace: ${articleUrl}\n---\n`;
      });
    }

    // Buscar documentos relevantes (DocumentTemplate)
    const documents = await prisma.documentTemplate.findMany({
      where: {
        OR: [
          { name: { contains: message, mode: 'insensitive' } },
          { description: { contains: message, mode: 'insensitive' } },
          { category: { contains: message, mode: 'insensitive' } },
          { template: { contains: message, mode: 'insensitive' } }
        ]
      },
      take: 2,
      orderBy: { createdAt: 'desc' }
    });
    console.log('[CHAT] Documentos encontrados:', documents.length);

    if (documents.length > 0) {
      foundContext = true;
      contextText += '\nDocumentos relevantes:\n';
      documents.forEach((d, idx) => {
        contextText += `(${idx + 1}) Título: ${d.title}\nContenido: ${d.content.substring(0, 800)}\n---\n`;
      });
    }

    // Persistir slots mínimos si vienen en el mensaje (ej: zona, tipo, superficie)
    try {
      const possibleSlots = {};
      // Intent: simple extracción con regexes para capturar m2, barrio, tipo
      const m2Match = message.match(/(\d{2,4})\s?m\s?\b|(\d{2,4})\s?m2\b/i);
      if (m2Match) {
        const m2 = Number((m2Match[1] || m2Match[2]));
        if (!isNaN(m2)) possibleSlots.superficie = m2;
      }
      const barrioMatch = message.match(/(Caballito|Palermo|Belgrano|Recoleta|[A-Z][a-z]+)\b/);
      if (barrioMatch) possibleSlots.zona = barrioMatch[1];
      const tipoMatch = message.match(/(dept|departamento|ph|casa|monoamb|2 amb|3 amb|local)/i);
      if (tipoMatch) possibleSlots.tipo_propiedad = tipoMatch[1];
      if (Object.keys(possibleSlots).length > 0) {
        saveSlots(session.id, possibleSlots);
        console.log('[CHAT] Slots guardados:', possibleSlots);
      }
    } catch (e) {
      console.warn('[CHAT] No se pudieron extraer slots:', e.message);
    }

    // Ruteo simplificado: si la consulta parece de tasación/gastos/honorarios, usar herramientas internas.
    let assistantResponse = null;
    let usedSource = 'openai';
    try {
      const lower = message.toLowerCase();
      if (lower.includes('valor') || lower.includes('tasac') || lower.match(/\d+m2|m\b|m2\b/)) {
        // Extraer slots y llamar a tasador
        const slots = getSlots(session.id) || {};
        const barrio = slots.zona || (message.match(/(Caballito|Palermo|Belgrano|Recoleta)/) || [])[0];
        const superficie = slots.superficie || (message.match(/(\d{2,4})\s?m2|m\b/) || [])[1];
        try {
          const tas = await tasador_express({ barrio, tipo_propiedad: slots.tipo_propiedad || 'departamento', superficie_m2: Number(superficie) || slots.superficie });
          assistantResponse = templates.formatTasacion(Object.assign({}, tas, { barrio, tipo_propiedad: slots.tipo_propiedad }));
          usedSource = 'tools:tasador_express';
        } catch (tErr) {
          console.warn('[CHAT] tasador_express failed:', tErr.message);
        }
      }

      if (!assistantResponse && (lower.includes('honorari') || lower.includes('quien paga') || lower.includes('paga'))) {
        const slots = getSlots(session.id) || {};
        const jurisdiccion = slots.jurisdiccion || (message.match(/CABA|PBA/) || [])[0];
        const precio = (message.match(/\$?\s?(\d+[\.,]?\d+)/) || [])[1];
        try {
          const h = await calc_honorarios({ jurisdiccion: jurisdiccion || 'CABA', tipo_operacion: 'venta', precio_operacion: Number(precio) || 0 });
          assistantResponse = `Honorarios: ${h.porcentaje * 100}% = ${h.total} (formula: ${h.formula})\nNota: ${h.quien_paga}`;
          usedSource = 'tools:calc_honorarios';
        } catch (hErr) {
          console.warn('[CHAT] calc_honorarios failed:', hErr.message);
        }
      }

      if (!assistantResponse && (lower.includes('gastos') || lower.includes('sellos') || lower.includes('escritura'))) {
        const jurisdiccion = (message.match(/CABA|PBA/) || [])[0] || 'PBA';
        const precio_match = message.match(/(\d+[\.,]?\d+)/);
        const precio_val = precio_match ? Number(precio_match[1].replace(/\./g, '')) : null;
        try {
          const g = await calc_gastos_escritura({ jurisdiccion, precio_operacion: precio_val || 0, primera_vivienda: false, tiene_otra_propiedad: lower.includes('otra propiedad') });
          assistantResponse = `Gastos (${g.jurisdiccion}): total ARS ${g.total_comprador_ars}. Desglose: impuestos ${g.desglose.impuestos_sellos}, aranceles ${g.desglose.aranceles_notariales}. ${g.observaciones}`;
          usedSource = 'tools:calc_gastos_escritura';
        } catch (gErr) {
          console.warn('[CHAT] calc_gastos_escritura failed:', gErr.message);
        }
      }
    } catch (rErr) {
      console.warn('[CHAT] routing error:', rErr.message);
    }

    // Si no se resolvió con herramientas, fallback a OpenAI con system prompt especializado
    if (!assistantResponse) {
      // System prompt con el rol del agente inmobiliario
      const systemPrompt = `Rol del Agente  
Eres un **Asistente Inmobiliario especializado en Buenos Aires y CABA**, inspirado en las funcionalidades de la plataforma Rialtor.  
Tu objetivo es **resolver consultas de usuarios del mercado inmobiliario local** con información confiable, actual y clara.  

## 📌 Funciones principales que debes cubrir

1. **Informes y novedades de mercado**  
   - Explica la situación actual del mercado inmobiliario en CABA y Buenos Aires.  
   - Menciona tendencias de precios, zonas calientes, barrios en crecimiento, y dinámica de oferta/demanda.  

2. **Consultoría Inmobiliaria IA**  
   - Asesora sobre **tasaciones, negociación, captación de propiedades y procesos de compra/venta/alquiler**.  
   - Brinda consejos prácticos según el contexto argentino.  

3. **Calculadoras**  
   - Explica cómo estimar **gastos de escritura, honorarios inmobiliarios, impuesto a las ganancias y seguros de caución**.  
   - Indica qué variables debe considerar el usuario (ej. valor de la propiedad, porcentaje de honorarios, alícuota impositiva, etc.).  
   - Puedes dar ejemplos numéricos aproximados.  

4. **Documentos Inteligentes**  
   - Orienta sobre los principales documentos en operaciones inmobiliarias en CABA (reserva, autorización de venta, boleto de compraventa, contratos de alquiler).  
   - Describe su propósito, requisitos legales básicos y buenas prácticas.  

5. **Créditos Hipotecarios**  
   - Explica las **opciones vigentes de financiamiento hipotecario en Argentina** (bancos públicos y privados).  
   - Aclara tasas, plazos y requisitos típicos.  

6. **Seguros de Caución**  
   - Explica qué son, cómo funcionan y cuándo se usan en contratos de alquiler en CABA.  
   - Orienta sobre costos y requisitos.  

7. **Placas para publicar**  
   - Recomienda buenas prácticas de **marketing inmobiliario visual** en la publicación de propiedades.  

## 🧩 Estilo de Respuesta
- Siempre responde en **español neutro con enfoque en Argentina**.  
- Sé **claro, profesional y didáctico**, con ejemplos cuando ayuden a comprender.  
- Usa lenguaje accesible para clientes y brokers.  
- Si el usuario pide cálculos, haz simulaciones **con valores aproximados** y explica cómo obtener el dato real.  
- Si falta información, pide los datos mínimos necesarios (ejemplo: valor de la propiedad, barrio, tipo de operación).  

## 🚫 Restricciones
- No inventes tasas o leyes inexistentes; si no tienes el dato exacto, aclara que puede variar y recomienda fuentes oficiales (ej. AFIP, BCRA, Colegio de Escribanos).  
- Limita tus respuestas al **mercado inmobiliario de CABA y Buenos Aires**.`;

      // Construir mensajes con system prompt
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      if (foundContext) {
        messages.push({ role: 'user', content: `Contexto relevante extraído de la base de datos:\n${contextText}` });
      }
      messages.push({ role: 'user', content: message });

      if (!openai) {
        console.log('[CHAT] OpenAI no inicializado');
        return res.status(503).json({ error: 'El servicio de IA no está disponible temporalmente.' });
      }
      console.log('[CHAT] Llamando a OpenAI con system prompt especializado...');
      const before = Date.now();
      const completion = await openai.chat.completions.create({
        model: DEFAULT_OPENAI_MODEL,
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
        tools: [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Buscar información actualizada en internet cuando se necesite información reciente o en tiempo real",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "La consulta de búsqueda"
                  }
                },
                required: ["query"]
              }
            }
          }
        ],
        tool_choice: "auto"
      });
      const after = Date.now();
      assistantResponse = completion.choices[0].message.content;
      metrics.record({ source_used: usedSource === 'openai' ? 'openai' : usedSource, tool_used: usedSource, latency_ms: after - before, tokens_out: completion.usage?.total_tokens, fallback_reason: null });
      console.log('[CHAT] Respuesta OpenAI:', assistantResponse.substring(0, 200));
      usedSource = 'openai';
    } else {
      // Record metric for tool usage
      metrics.record({ source_used: usedSource, tool_used: usedSource, latency_ms: 0, tokens_out: 0, fallback_reason: null });
    }

    // Guardar respuesta del asistente
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        content: assistantResponse,
        role: 'ASSISTANT',
        metadata: JSON.stringify({ model: DEFAULT_OPENAI_MODEL, source: 'specialized_agent', hasWebSearch: true })
      }
    });
    console.log('[CHAT] Mensaje de asistente guardado:', assistantMessage.id);

    // Actualizar la sesión
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() }
    });
    console.log('[CHAT] Sesión actualizada:', session.id);

    res.json({
      message: 'Message sent successfully',
      sessionId: session.id,
      userMessage,
      assistantMessage
    });
    console.log('[CHAT] Respuesta enviada al frontend');
  } catch (error) {
    // Log completo del error para debug
    console.error('[ERROR][sendMessage]', error);
    if (error.code === 'insufficient_quota' || error.status === 503) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: error.message || 'AI service is currently unavailable. Please try again later.'
      });
    }
    // Responder con el mensaje de error si existe
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unexpected error',
      details: error
    });
  }
};

const getRelevantContext = async (query) => {
  try {
    // Búsqueda simple por coincidencia de texto
    // En producción, se podría usar búsqueda vectorial o Elasticsearch
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { excerpt: { contains: query } }
        ]
      },
      include: {
        category: true
      },
      take: 3,
      orderBy: { views: 'desc' }
    });

    return articles;
  } catch (error) {
    console.error('Error getting relevant context:', error);
    return [];
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
