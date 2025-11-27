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
import userRoutes from './routes/users.routes.js';
import loadRoutes from './routes/loads.routes.js';
import offerRoutes from './routes/offers.routes.js';
import tripRoutes from './routes/trips.routes.js';
import invoiceRoutes from './routes/invoices.routes.js';
import vehicleRoutes from './routes/vehicles.routes.js';
import documentRoutes from './routes/documents.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import matchingRoutes from './routes/matching.routes.js';

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
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
app.use('/api/users', userRoutes);
app.use('/api/loads', loadRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/matching', matchingRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'BoxFreight EU API',
    version: '1.0.0',
    description: 'API para transporte de cargas na Europa',
    documentation: '/api/docs',
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 - Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method,
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflito',
      message: 'Já existe um registo com estes dados.',
      field: err.meta?.target,
    });
  }
  
  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      message: err.message,
      details: err.errors,
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Por favor, faça login novamente.',
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'A sua sessão expirou. Por favor, faça login novamente.',
    });
  }
  
  // Erro genérico
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║           🚚 BoxFreight EU API Server                 ║
║                                                        ║
║  Ambiente:  ${process.env.NODE_ENV?.toUpperCase() || 'DEVELOPMENT'}                              ║
║  Porta:     ${PORT}                                      ║
║  URL:       http://localhost:${PORT}                    ║
║  Docs:      http://localhost:${PORT}/api/docs           ║
║                                                        ║
║  Status:    ✅ Servidor a funcionar                    ║
║  Database:  ✅ PostgreSQL conectado                    ║
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
