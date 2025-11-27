// ============================================
// Ratings Routes - Gestão de Avaliações
// ============================================

import express from 'express';
import { body } from 'express-validator';
import * as ratingsController from '../controllers/ratings.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const createRatingValidation = [
  body('toUserId').isUUID().withMessage('ID de utilizador inválido'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5'),
  body('comment').optional().trim(),
  body('loadId').optional().isUUID(),
];

/**
 * @route   POST /api/ratings
 * @desc    Criar avaliação
 * @access  Private
 */
router.post('/', authenticate, createRatingValidation, ratingsController.createRating);

/**
 * @route   GET /api/ratings/user/:userId
 * @desc    Listar avaliações de um utilizador
 * @access  Public
 */
router.get('/user/:userId', ratingsController.getUserRatings);

/**
 * @route   GET /api/ratings/my/given
 * @desc    Listar avaliações dadas pelo utilizador
 * @access  Private
 */
router.get('/my/given', authenticate, ratingsController.getMyGivenRatings);

/**
 * @route   PUT /api/ratings/:id
 * @desc    Atualizar avaliação
 * @access  Private (Owner)
 */
router.put('/:id', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5'),
  body('comment').optional().trim(),
], ratingsController.updateRating);

/**
 * @route   DELETE /api/ratings/:id
 * @desc    Eliminar avaliação
 * @access  Private (Owner ou ADMIN)
 */
router.delete('/:id', authenticate, ratingsController.deleteRating);

export default router;
