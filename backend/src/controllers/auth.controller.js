// ============================================
// Auth Controller - Lógica de Autenticação
// ============================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { prisma } from '../server.js';
import crypto from 'crypto';

// ============================================
// HELPERS
// ============================================

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// ============================================
// CONTROLLERS
// ============================================

/**
 * @desc    Registar novo utilizador
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    // Validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password, firstName, lastName, role, phone, country, companyName, fiscalNumber } = req.body;
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email já registado' });
    }
    
    // Hash da password
    const hashedPassword = await hashPassword(password);
    
    // Criar utilizador
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phone,
        country: country || 'PT',
        companyName,
        fiscalNumber,
        status: 'PENDING', // Requer verificação
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    
    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Guardar refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });
    
    // TODO: Enviar email de verificação
    
    res.status(201).json({
      message: 'Utilizador registado com sucesso',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login de utilizador
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Buscar utilizador
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Verificar password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Verificar se conta está bloqueada
    if (user.status === 'BLOCKED') {
      return res.status(403).json({ error: 'Conta bloqueada. Contacte o suporte.' });
    }
    
    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Atualizar refresh token e último login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLoginAt: new Date(),
      },
    });
    
    // Remover password da resposta
    const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;
    
    res.json({
      message: 'Login efetuado com sucesso',
      user: userWithoutSensitiveData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Renovar access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token não fornecido' });
    }
    
    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Buscar utilizador
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }
    
    // Gerar novos tokens
    const tokens = generateTokens(user.id);
    
    // Atualizar refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });
    
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    }
    next(error);
  }
};

/**
 * @desc    Logout
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    // Remover refresh token
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });
    
    res.json({ message: 'Logout efetuado com sucesso' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obter dados do utilizador autenticado
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        avatar: true,
        fiscalNumber: true,
        companyName: true,
        companyAddress: true,
        country: true,
        language: true,
        emailVerified: true,
        phoneVerified: true,
        documentsVerified: true,
        rating: true,
        totalRatings: true,
        completedTrips: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Solicitar reset de password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Não revelar se email existe (segurança)
    if (!user) {
      return res.json({ message: 'Se o email existir, receberá instruções para reset de password' });
    }
    
    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
    
    // TODO: Enviar email com link de reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log('Reset URL:', resetUrl);
    
    res.json({ message: 'Se o email existir, receberá instruções para reset de password' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resetar password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { token, password } = req.body;
    
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }
    
    // Hash da nova password
    const hashedPassword = await hashPassword(password);
    
    // Atualizar password e limpar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    
    res.json({ message: 'Password alterada com sucesso' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Alterar password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    
    // Verificar password atual
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password atual incorreta' });
    }
    
    // Hash da nova password
    const hashedPassword = await hashPassword(newPassword);
    
    // Atualizar password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    res.json({ message: 'Password alterada com sucesso' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verificar email
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    // TODO: Implementar lógica de verificação de email
    // Por agora, apenas simular
    
    res.json({ message: 'Email verificado com sucesso' });
  } catch (error) {
    next(error);
  }
};
