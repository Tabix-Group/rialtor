const express = require('express');
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();

// Configura OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Initialize Prisma (with error handling)
let prisma;
try {
  prisma = new PrismaClient();
  console.log('[CALENDAR] Prisma client initialized');
} catch (error) {
  console.error('[CALENDAR] Failed to initialize Prisma:', error);
  prisma = null;
}

// Middleware para verificar autenticación del usuario
const { authenticateToken } = require('../middleware/auth');

// Ruta para iniciar autenticación con Google
router.get('/auth', async (req, res) => {
  try {
    // Get user from token for the OAuth flow
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token and get user
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('[CALENDAR] Auth route called for user:', decoded.userId);
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: decoded.userId // Pasar userId en state
    });
    console.log('[CALENDAR] Generated auth URL');
    res.redirect(authUrl);
  } catch (error) {
    console.error('[CALENDAR] Error in auth route:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Something went wrong' });
  }
});

// Callback de OAuth
router.get('/auth/callback', async (req, res) => {
  const { code, state: userId } = req.query;
  console.log('[CALENDAR] Callback called with code and userId:', !!code, !!userId);
  try {
    if (!prisma) {
      console.error('[CALENDAR] Prisma not available in callback');
      return res.status(500).json({ error: 'Database not available' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('[CALENDAR] Tokens obtained from Google');

    // Guardar tokens en DB
    await prisma.calendarToken.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        updatedAt: new Date()
      },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null
      }
    });
    console.log('[CALENDAR] Tokens saved to database');

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendar=connected`);
  } catch (error) {
    console.error('Error en callback:', error);
    res.status(500).json({ error: 'Error al conectar calendario' });
  }
});

// Obtener eventos
router.get('/events', authenticateToken, async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const token = await prisma.calendarToken.findUnique({
      where: { userId: req.user.id }
    });

    if (!token) {
      return res.status(401).json({ error: 'Calendario no conectado' });
    }

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: token.expiryDate ? token.expiryDate.getTime() : null
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime'
    });

    res.json(response.data.items);
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// Crear evento
router.post('/events', authenticateToken, async (req, res) => {
  const { summary, description, start, end } = req.body;

  try {
    if (!prisma) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const token = await prisma.calendarToken.findUnique({
      where: { userId: req.user.id }
    });

    if (!token) {
      return res.status(401).json({ error: 'Calendario no conectado' });
    }

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: token.expiryDate ? token.expiryDate.getTime() : null
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const event = await calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary,
        description,
        start: { dateTime: start },
        end: { dateTime: end }
      }
    });

    res.json(event.data);
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// Eliminar evento
router.delete('/events/:eventId', authenticateToken, async (req, res) => {
  const { eventId } = req.params;

  try {
    if (!prisma) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const token = await prisma.calendarToken.findUnique({
      where: { userId: req.user.id }
    });

    if (!token) {
      return res.status(401).json({ error: 'Calendario no conectado' });
    }

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: token.expiryDate ? token.expiryDate.getTime() : null
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    });

    res.json({ message: 'Evento eliminado' });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

module.exports = router;