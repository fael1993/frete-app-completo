// ============================================
// Users Routes - Gestão de Utilizadores
// ============================================

import express from 'express';
import { body, query } from 'express-validator';
import * as usersController from '../controllers/users.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validações
const updateProfileValidation = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone('any'),
  body('country').optional().isLength({ min: 2, max: 2 }),
];

/**
 * @route   GET /api/users
 * @desc    Listar utilizadores (Admin)
 * @access  Private (ADMIN)
 */
router.get('/', authenticate, authorize('ADMIN'), usersController.getUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Obter estatísticas do utilizador
 * @access  Private
 */
router.get('/stats', authenticate, usersController.getUserStats);

/**
 * @route   GET /api/users/:id
 * @desc    Obter utilizador por ID
 * @access  Private
 */
router.get('/:id', authenticate, usersController.getUserById);

/**
 * @route   PUT /api/users/profile
 * @desc    Atualizar perfil
 * @access  Private
 */
router.put('/profile', authenticate, updateProfileValidation, usersController.updateProfile);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Atualizar status do utilizador
 * @access  Private (ADMIN)
 */
router.patch('/:id/status', authenticate, authorize('ADMIN'), usersController.updateUserStatus);

/**
 * @route   PATCH /api/users/:id/verify-documents
 * @desc    Verificar documentos do utilizador
 * @access  Private (ADMIN)
 */
router.patch('/:id/verify-documents', authenticate, authorize('ADMIN'), usersController.verifyUserDocuments);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar conta
 * @access  Private
 */
router.delete('/:id', authenticate, usersController.deleteUser);

export default router;
