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
const metrics = require('../instrumentation/rialtorMetrics');
const templates = require('../templates/rialtorTemplates');

const sendMessage = async (req, res, next) => {
  try {
    console.log('[CHAT] sendMessage called');
    const { message, sessionId } = req.body;
    const userId = req.user.id;
    console.log('[CHAT] userId:', userId, 'sessionId:', sessionId, 'message:', message);

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

    // Guardar mensaje del usuario
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

    // Si no se resolvió con herramientas, fallback a la lógica anterior (OpenAI con contexto si existe)
    if (!assistantResponse) {
      // Construir prompt para OpenAI
      let systemPrompt = '';
      if (foundContext) {
        systemPrompt = `Eres RIALTOR, un consultor de IA especializado EXCLUSIVAMENTE en el sector inmobiliario argentino (AMBA). El siguiente CONTEXTO contiene artículos y documentos extraídos de la base de datos interna. Prioriza responder usando este contexto y especifica si la info no está en KB interna. CONTEXT:\n${contextText}`;
      } else {
        // System prompt inmutable (short) as requested by config
        systemPrompt = `Eres RIALTOR, un consultor de IA especializado EXCLUSIVAMENTE en el sector inmobiliario argentino, con foco en AMBA. Responde brevemente y con pasos accionables.`;
      }
      console.log('[CHAT] Prompt generado para OpenAI:', systemPrompt.substring(0, 300));

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ];

      if (!openai) {
        console.log('[CHAT] OpenAI no inicializado');
        return res.status(503).json({ error: 'El servicio de IA no está disponible temporalmente.' });
      }
      console.log('[CHAT] Llamando a OpenAI...');
      const before = Date.now();
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
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
        metadata: JSON.stringify({ model: 'hybrid-rialtor', source: 'internal' })
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
