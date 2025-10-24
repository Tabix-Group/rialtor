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

    // Return the URL as JSON instead of redirecting
    res.json({ authUrl });
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
      return res.status(401).json({ error: 'CALENDAR_NOT_CONNECTED' });
    }

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: token.expiryDate ? token.expiryDate.getTime() : null
    });

    // Obtener eventos de los últimos 3 meses hasta 6 meses en el futuro
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    const sixMonthsAhead = new Date(now);
    sixMonthsAhead.setMonth(now.getMonth() + 6);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: threeMonthsAgo.toISOString(),
      timeMax: sixMonthsAhead.toISOString(),
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime'
    });

    // Mapear eventos de Google al formato esperado por el frontend
    const events = (response.data.items || []).map(event => ({
      id: event.id,
      title: event.summary || 'Sin título',
      description: event.description || '',
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      source: 'google',
      meetLink: event.hangoutLink || null
    }));

    res.json({ events });
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

    // Validar campos requeridos
    if (!summary || !start || !end) {
      return res.status(400).json({ error: 'Faltan campos requeridos: summary, start, end' });
    }

    const token = await prisma.calendarToken.findUnique({
      where: { userId: req.user.id }
    });

    if (!token) {
      return res.status(401).json({ error: 'CALENDAR_NOT_CONNECTED' });
    }

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: token.expiryDate ? token.expiryDate.getTime() : null
    });

    // Formatear fechas con timezone
    const startDate = new Date(start);
    const endDate = new Date(end);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary,
        description,
        start: { 
          dateTime: startDate.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires'
        },
        end: { 
          dateTime: endDate.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires'
        },
        conferenceData: req.body.addMeet ? {
          createRequest: {
            requestId: `${Date.now()}-${Math.random()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        } : undefined
      },
      conferenceDataVersion: req.body.addMeet ? 1 : 0
    });

    // Mapear la respuesta al formato esperado por el frontend
    const event = {
      id: response.data.id,
      title: response.data.summary || 'Sin título',
      description: response.data.description || '',
      start: response.data.start.dateTime || response.data.start.date,
      end: response.data.end.dateTime || response.data.end.date,
      source: 'google',
      meetLink: response.data.hangoutLink || null
    };

    res.json({ event });
  } catch (error) {
    console.error('Error creando evento:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Error al crear evento',
      details: error.message 
    });
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
      return res.status(401).json({ error: 'CALENDAR_NOT_CONNECTED' });
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