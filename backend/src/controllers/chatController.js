require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

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

// Modelo OpenAI configurable
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

    // Generar respuesta con OpenAI
    let assistantResponse = 'Lo siento, el servicio de IA no está disponible.';
    if (openai) {
      const systemPrompt = 'Eres un asistente útil y amigable. Responde de manera clara y concisa.';

      const completion = await openai.chat.completions.create({
        model: DEFAULT_OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      assistantResponse = completion.choices[0].message.content;
    }

    // Guardar respuesta del asistente
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        content: assistantResponse,
        role: 'ASSISTANT'
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
