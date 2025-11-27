// ============================================
// Loads Routes - Gestão de Cargas
// ============================================

import express from 'express';
import { body, query } from 'express-validator';
import * as loadsController from '../controllers/loads.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// VALIDAÇÕES
// ============================================

const createLoadValidation = [
  body('originAddress').notEmpty().withMessage('Endereço de origem é obrigatório'),
  body('originCity').notEmpty().withMessage('Cidade de origem é obrigatória'),
  body('originPostalCode').notEmpty().withMessage('Código postal de origem é obrigatório'),
  body('originCountry').isLength({ min: 2, max: 2 }).withMessage('País de origem inválido'),
  body('destAddress').notEmpty().withMessage('Endereço de destino é obrigatório'),
  body('destCity').notEmpty().withMessage('Cidade de destino é obrigatória'),
  body('destPostalCode').notEmpty().withMessage('Código postal de destino é obrigatório'),
  body('destCountry').isLength({ min: 2, max: 2 }).withMessage('País de destino inválido'),
  body('loadType').isIn(['GENERAL', 'PALLETIZED', 'REFRIGERATED', 'FRAGILE', 'HAZARDOUS', 'OVERSIZED', 'LIQUID', 'BULK']).withMessage('Tipo de carga inválido'),
  body('weight').isFloat({ min: 0 }).withMessage('Peso deve ser maior que 0'),
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('pickupDate').isISO8601().withMessage('Data de recolha inválida'),
  body('deliveryDate').isISO8601().withMessage('Data de entrega inválida'),
];

const searchValidation = [
  query('originCountry').optional().isLength({ min: 2, max: 2 }),
  query('destCountry').optional().isLength({ min: 2, max: 2 }),
  query('loadType').optional().isIn(['GENERAL', 'PALLETIZED', 'REFRIGERATED', 'FRAGILE', 'HAZARDOUS', 'OVERSIZED', 'LIQUID', 'BULK']),
  query('minWeight').optional().isFloat({ min: 0 }),
  query('maxWeight').optional().isFloat({ min: 0 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

// ============================================
// ROTAS
// ============================================

/**
 * @route   GET /api/loads
 * @desc    Listar cargas (com filtros e paginação)
 * @access  Public (com auth opcional para personalização)
 */
router.get('/', searchValidation, loadsController.getLoads);

/**
 * @route   GET /api/loads/:id
 * @desc    Obter detalhes de uma carga
 * @access  Public
 */
router.get('/:id', loadsController.getLoadById);

/**
 * @route   POST /api/loads
 * @desc    Criar nova carga
 * @access  Private (EMBARCADOR)
 */
router.post('/', authenticate, authorize('EMBARCADOR', 'ADMIN'), createLoadValidation, loadsController.createLoad);

/**
 * @route   PUT /api/loads/:id
 * @desc    Atualizar carga
 * @access  Private (Owner ou ADMIN)
 */
router.put('/:id', authenticate, createLoadValidation, loadsController.updateLoad);

/**
 * @route   PATCH /api/loads/:id/publish
 * @desc    Publicar carga
 * @access  Private (Owner ou ADMIN)
 */
router.patch('/:id/publish', authenticate, loadsController.publishLoad);

/**
 * @route   PATCH /api/loads/:id/cancel
 * @desc    Cancelar carga
 * @access  Private (Owner ou ADMIN)
 */
router.patch('/:id/cancel', authenticate, loadsController.cancelLoad);

/**
 * @route   DELETE /api/loads/:id
 * @desc    Eliminar carga (apenas rascunhos)
 * @access  Private (Owner ou ADMIN)
 */
router.delete('/:id', authenticate, loadsController.deleteLoad);

/**
 * @route   GET /api/loads/my/loads
 * @desc    Listar cargas do utilizador autenticado
 * @access  Private
 */
router.get('/my/loads', authenticate, loadsController.getMyLoads);

export default router;
