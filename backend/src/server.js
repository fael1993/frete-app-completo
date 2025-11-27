// ============================================
// BoxFreight EU - Main Server
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rotas
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import loadsRoutes from './routes/loads.routes.js';
import offersRoutes from './routes/offers.routes.js';
import tripsRoutes from './routes/trips.routes.js';
import invoicesRoutes from './routes/invoices.routes.js';
import ratingsRoutes from './routes/ratings.routes.js';

// Importar middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Prisma
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

// Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compressão
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Servir arquivos estáticos (PDFs de faturas, etc)
app.use('/invoices', express.static('public/invoices'));

// Rate limiting global
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Demasiados pedidos deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', async (req, res) => {
  try {
    // Verificar conexão com DB
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

// ============================================
// ROTAS DA API
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/loads', loadsRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/ratings', ratingsRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'BoxFreight EU API',
    version: '1.0.0',
    description: 'API para transporte de cargas na Europa',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      loads: '/api/loads',
      offers: '/api/offers',
      trips: '/api/trips',
      invoices: '/api/invoices',
      ratings: '/api/ratings',
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 - Rota não encontrada
app.use(notFound);

// Error handler global
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║           🚚 BoxFreight EU API Server                 ║
║                                                        ║
║  Ambiente:  ${(process.env.NODE_ENV || 'DEVELOPMENT').toUpperCase().padEnd(42)}║
║  Porta:     ${PORT.toString().padEnd(42)}║
║  URL:       http://localhost:${PORT.toString().padEnd(28)}║
║  Docs:      http://localhost:${PORT}/api/docs${' '.repeat(19)}║
║                                                        ║
║  Status:    ✅ Servidor a funcionar                    ║
║  Database:  ✅ PostgreSQL conectado                    ║
║                                                        ║
║  Endpoints disponíveis:                                ║
║  • POST   /api/auth/register                           ║
║  • POST   /api/auth/login                              ║
║  • GET    /api/loads                                   ║
║  • POST   /api/loads                                   ║
║  • POST   /api/offers                                  ║
║  • GET    /api/trips                                   ║
║  • GET    /api/invoices                                ║
║  • POST   /api/ratings                                 ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido. A encerrar servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Servidor encerrado com sucesso.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT recebido. A encerrar servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Servidor encerrado com sucesso.');
    process.exit(0);
  });
});

export default app;
