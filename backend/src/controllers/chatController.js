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

    // Buscar contexto relevante en artículos y documentos
    let contextText = '';
    let foundContext = false;

    // Buscar artículos relevantes
    // Búsqueda semántica avanzada en artículos
    // Buscar SOLO en la base de datos local (Postgres)
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

    if (articles.length > 0) {
      foundContext = true;
      contextText += 'Artículos relevantes:\n';
      articles.forEach((a, idx) => {
        // Si el artículo viene de semantic_search y no tiene slug, buscarlo en la base
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
        contextText += `(${idx+1}) Título: ${title}\nResumen: ${excerpt}\nContenido: ${content.substring(0, 800)}\nCategoría: ${category}\nEnlace: ${articleUrl}\n---\n`;
      });
    }

    // Buscar documentos relevantes (DocumentTemplate)
    // Búsqueda semántica avanzada en documentos
    // Buscar SOLO en la base de datos local (Postgres)
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

    if (documents.length > 0) {
      foundContext = true;
      contextText += '\nDocumentos relevantes:\n';
      documents.forEach((d, idx) => {
        contextText += `(${idx+1}) Título: ${d.title}\nContenido: ${d.content.substring(0, 800)}\n---\n`;
      });
    }

    // Construir prompt para OpenAI
    let systemPrompt = '';
    if (foundContext) {
      systemPrompt = `Eres un asistente experto en bienes raíces de Argentina trabajando para RE/MAX. El siguiente CONTEXTO contiene artículos y documentos extraídos de la base de datos interna de RE/MAX. SOLO puedes responder usando la información que aparece en este contexto. Si tu respuesta se basa en un artículo, debes citar el enlace de referencia incluido en el contexto. Si la pregunta no está respondida en el contexto, responde exactamente: 'No tengo información suficiente sobre este tema en la base de conocimiento.' No inventes ni uses información externa, ni respondas sobre temas que no aparecen en el contexto.\n\nCONTEXT:\n${contextText}`;
    } else {
      systemPrompt = `No tengo información suficiente sobre este tema en la base de conocimiento.`;
    }
    // LOG: Mostrar el contexto y el prompt antes de enviar a OpenAI
    console.log('--- CONTEXTO ENVIADO A OPENAI ---');
    console.log(systemPrompt);
    console.log('----------------------------------');

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ];

    // Llamar a OpenAI solo si está inicializado
    if (!openai) {
      return res.status(503).json({ error: 'El servicio de IA no está disponible temporalmente.' });
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    });
    let assistantResponse = completion.choices[0].message.content;
    // LOG: Mostrar la respuesta recibida de OpenAI
    console.log('--- RESPUESTA OPENAI ---');
    console.log(assistantResponse);
    console.log('------------------------');

    // Si la respuesta es muy restrictiva, permite una respuesta general
    if (assistantResponse.includes('No tengo información suficiente') && !foundContext) {
      // Reintentar con prompt menos restrictivo
      const fallbackMessages = [
        {
          role: 'system',
          content: 'Eres un asistente experto en bienes raíces de Argentina trabajando para RE/MAX. Ayuda a los agentes inmobiliarios respondiendo sus consultas de manera profesional y precisa.'
        },
        {
          role: 'user',
          content: message
        }
      ];
      const fallbackCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
        messages: fallbackMessages,
        max_tokens: 1000,
        temperature: 0.7
      });
      assistantResponse = fallbackCompletion.choices[0].message.content;
    }

    // Guardar respuesta del asistente
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        content: assistantResponse,
        role: 'ASSISTANT',
        metadata: JSON.stringify({
          model: 'gpt-4o',
          tokens: completion.usage?.total_tokens
        })
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
      assistantMessage
    });
  } catch (error) {
    if (error.code === 'insufficient_quota' || error.status === 503) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: error.message || 'AI service is currently unavailable. Please try again later.'
      });
    }
    next(error);
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

module.exports = {
  createChatSession,
  getChatSessions,
  getChatSession,
  sendMessage,
  deleteChatSession,
  updateChatSession
};
