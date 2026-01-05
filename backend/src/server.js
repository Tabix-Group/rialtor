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
const { startCronJobs } = require('./services/cronJobs');

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
const formsRoutes = require('./routes/forms');
const financesRoutes = require('./routes/finances');
const prospectsRoutes = require('./routes/prospects');
const favoritesRoutes = require('./routes/favorites');
const indicatorsRoutes = require('./routes/indicators');
const newslettersRoutes = require('./routes/newsletters');

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
  const env = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,https://www.rialtor.app,https://rialtor.app';
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
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Compression
app.use(compression());


// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Favicon support (returns a 204 No Content if not present)
app.get('/favicon.ico', (req, res) => res.status(204).end());

const rolesRouter = require('./routes/roles');
const permissionsRouter = require('./routes/permissions');
const { PrismaClient } = require('@prisma/client');

console.log('[SERVER] Initializing Prisma client...');
let prisma;
try {
  prisma = new PrismaClient();
  console.log('[SERVER] Prisma client initialized successfully');
} catch (error) {
  console.error('[SERVER] Failed to initialize Prisma client:', error);
  // Continue without Prisma for health check
  prisma = null;
}

// Simple ping endpoint that doesn't require database
app.get('/ping', (req, res) => {
  console.log('[PING] Ping requested');
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Health check with database status
app.get('/health', async (req, res) => {
  console.log('[HEALTH] Health check requested');
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    database: 'unknown',
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL ? 'configured' : 'missing',
    prisma_initialized: !!prisma
  };

  if (!prisma) {
    healthData.database = 'prisma_not_initialized';
    healthData.status = 'DEGRADED';
    console.log('[HEALTH] Prisma not initialized');
  } else {
    try {
      console.log('[HEALTH] Testing database connection...');
      await prisma.$queryRaw`SELECT 1`;
      healthData.database = 'connected';
      console.log('[HEALTH] Database connected successfully');
    } catch (error) {
      console.log('[HEALTH] Database connection failed:', error.message);
      healthData.database = 'disconnected';
      healthData.dbError = error.message;
      healthData.status = 'DEGRADED';
    }
  }

  const statusCode = healthData.status === 'OK' ? 200 : 503;
  console.log(`[HEALTH] Responding with status ${statusCode}:`, healthData.status);
  res.status(statusCode).json(healthData);
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
app.use('/api/forms', formsRoutes);
app.use('/api/finances', financesRoutes);
app.use('/api/prospects', prospectsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/indicators', indicatorsRoutes);
app.use('/api/newsletters', newslettersRoutes);
app.use('/api/calendar', require('./routes/calendar'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
console.log('[SERVER] Starting server initialization...');
console.log('[SERVER] PORT:', PORT);
console.log('[SERVER] NODE_ENV:', process.env.NODE_ENV);
console.log('[SERVER] DATABASE_URL configured:', !!process.env.DATABASE_URL);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💡 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️ Database connection: ${process.env.DATABASE_URL ? 'configured' : 'missing'}`);
  
  // Iniciar tareas programadas (cron jobs)
  startCronJobs();
});

module.exports = app;
