// ============================================
// Auth Routes - Autenticação e Registo
// ============================================

import express from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting para autenticação (mais restritivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  message: 'Demasiadas tentativas de login. Tente novamente em 15 minutos.',
});

// ============================================
// VALIDAÇÕES
// ============================================

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('Password deve ter no mínimo 8 caracteres'),
  body('firstName').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('lastName').trim().notEmpty().withMessage('Apelido é obrigatório'),
  body('role').isIn(['EMBARCADOR', 'TRANSPORTADOR', 'OPERADOR']).withMessage('Tipo de utilizador inválido'),
  body('phone').optional().isMobilePhone('any').withMessage('Número de telefone inválido'),
  body('country').optional().isLength({ min: 2, max: 2 }).withMessage('Código de país inválido'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Password é obrigatória'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token é obrigatório'),
  body('password').isLength({ min: 8 }).withMessage('Password deve ter no mínimo 8 caracteres'),
];

// ============================================
// ROTAS PÚBLICAS
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Registar novo utilizador
 * @access  Public
 */
router.post('/register', authLimiter, registerValidation, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de utilizador
 * @access  Public
 */
router.post('/login', authLimiter, loginValidation, authController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar reset de password
 * @access  Public
 */
router.post('/forgot-password', authLimiter, forgotPasswordValidation, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Resetar password com token
 * @access  Public
 */
router.post('/reset-password', authLimiter, resetPasswordValidation, authController.resetPassword);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token usando refresh token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verificar email com token
 * @access  Public
 */
router.post('/verify-email', authController.verifyEmail);

// ============================================
// ROTAS PROTEGIDAS
// ============================================

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do utilizador autenticado
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (invalidar refresh token)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Alterar password
 * @access  Private
 */
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Password atual é obrigatória'),
  body('newPassword').isLength({ min: 8 }).withMessage('Nova password deve ter no mínimo 8 caracteres'),
], authController.changePassword);

export default router;
