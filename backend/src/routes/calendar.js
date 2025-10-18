const express = require('express');
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Configura OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Middleware para verificar autenticación del usuario
const { authenticateToken } = require('../middleware/auth');

// Ruta para iniciar autenticación con Google
router.get('/auth', authenticateToken, (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: req.user.id // Pasar userId en state
  });
  res.redirect(authUrl);
});

// Callback de OAuth
router.get('/auth/callback', async (req, res) => {
  const { code, state: userId } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

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

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendar=connected`);
  } catch (error) {
    console.error('Error en callback:', error);
    res.status(500).json({ error: 'Error al conectar calendario' });
  }
});

// Obtener eventos
router.get('/events', authenticateToken, async (req, res) => {
  try {
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