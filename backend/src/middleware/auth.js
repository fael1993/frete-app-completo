// ============================================
// Auth Middleware - Autenticação JWT
// ============================================

import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';

/**
 * Middleware para autenticar utilizador via JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    // Obter token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    const token = authHeader.substring(7); // Remove "Bearer "
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar utilizador
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
      },
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Utilizador não encontrado' });
    }
    
    if (user.status === 'BLOCKED') {
      return res.status(403).json({ error: 'Conta bloqueada' });
    }
    
    // Adicionar utilizador ao request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    next(error);
  }
};

/**
 * Middleware para verificar role do utilizador
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sem permissão para aceder a este recurso' });
    }
    
    next();
  };
};

/**
 * Middleware opcional - não falha se não houver token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });
    
    if (user && user.status !== 'BLOCKED') {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Ignorar erros de token em auth opcional
    next();
  }
};
