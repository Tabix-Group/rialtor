const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const articleRoutes = require('./routes/articles');
const chatRoutes = require('./routes/chat');
const documentRoutes = require('./routes/documents');
const calculatorRoutes = require('./routes/calculator');
const adminRoutes = require('./routes/admin');
const placasRoutes = require('./routes/placas');
const newsRoutes = require('./routes/news');
const filesRoutes = require('./routes/files');

const app = express();
// Confía en el primer proxy (Railway/Nginx)
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3003;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
// Support multiple frontend origins via FRONTEND_URLS (comma separated) or single FRONTEND_URL
const getAllowedOrigins = () => {
  const env = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003';
  return env.split(',').map(s => s.trim()).filter(Boolean);
};

const allowedOrigins = getAllowedOrigins();

// Log allowed origins on startup to help debugging deployed env vars
console.log('✅ Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (e.g., server-to-server, mobile clients)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow by suffix for the custom domain to avoid blocking www/rialtor variants
    try {
      const parsed = new URL(origin);
      const hostname = parsed.hostname || '';
      // Allow the root domain and any subdomain of rialtor.app
      if (hostname === 'rialtor.app' || hostname === 'www.rialtor.app' || hostname.endsWith('.rialtor.app')) {
        console.log(`[CORS] Allowed origin by domain rule: ${origin}`);
        return callback(null, true);
      }
    } catch (e) {
      // if URL parsing fails, fall through to blocking
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Respond to preflight OPTIONS using same options
app.options('*', cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());


// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Favicon support (returns a 204 No Content if not present)
app.get('/favicon.ico', (req, res) => res.status(204).end());

const rolesRouter = require('./routes/roles');
const permissionsRouter = require('./routes/permissions');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Health check with database status
app.get('/health', async (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    database: 'unknown'
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthData.database = 'connected';
  } catch (error) {
    healthData.database = 'disconnected';
    healthData.dbError = error.message;
    healthData.status = 'DEGRADED';
  }

  res.status(healthData.status === 'OK' ? 200 : 503).json(healthData);
});

// Log global para cualquier petición DELETE
app.use((req, res, next) => {
  if (req.method === 'DELETE') {
    console.log(`[SERVER] DELETE recibido: ${req.originalUrl}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/roles', rolesRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/placas', placasRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/files', filesRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💡 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️ Database connection: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);
});

module.exports = app;
