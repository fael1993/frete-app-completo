// ============================================
// Offers Routes - Gestão de Propostas
// ============================================

import express from 'express';
import { body } from 'express-validator';
import * as offersController from '../controllers/offers.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const createOfferValidation = [
  body('loadId').isUUID().withMessage('ID de carga inválido'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser maior que 0'),
  body('estimatedPickup').isISO8601().withMessage('Data de recolha inválida'),
  body('estimatedDelivery').isISO8601().withMessage('Data de entrega inválida'),
];

/**
 * @route   POST /api/offers
 * @desc    Criar proposta para uma carga
 * @access  Private (TRANSPORTADOR)
 */
router.post('/', authenticate, authorize('TRANSPORTADOR', 'ADMIN'), createOfferValidation, offersController.createOffer);

/**
 * @route   GET /api/offers/load/:loadId
 * @desc    Listar propostas de uma carga
 * @access  Private (Owner da carga)
 */
router.get('/load/:loadId', authenticate, offersController.getOffersByLoad);

/**
 * @route   GET /api/offers/my/offers
 * @desc    Listar propostas do transportador
 * @access  Private (TRANSPORTADOR)
 */
router.get('/my/offers', authenticate, authorize('TRANSPORTADOR', 'ADMIN'), offersController.getMyOffers);

/**
 * @route   PATCH /api/offers/:id/accept
 * @desc    Aceitar proposta
 * @access  Private (Owner da carga)
 */
router.patch('/:id/accept', authenticate, offersController.acceptOffer);

/**
 * @route   PATCH /api/offers/:id/reject
 * @desc    Rejeitar proposta
 * @access  Private (Owner da carga)
 */
router.patch('/:id/reject', authenticate, offersController.rejectOffer);

/**
 * @route   DELETE /api/offers/:id
 * @desc    Cancelar proposta
 * @access  Private (Owner da proposta)
 */
router.delete('/:id', authenticate, offersController.cancelOffer);

export default router;
