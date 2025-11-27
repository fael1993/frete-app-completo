// ============================================
// Trips Routes - Gestão de Viagens
// ============================================

import express from 'express';
import { body } from 'express-validator';
import * as tripsController from '../controllers/trips.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/trips
 * @desc    Listar viagens
 * @access  Private
 */
router.get('/', authenticate, tripsController.getTrips);

/**
 * @route   GET /api/trips/:id
 * @desc    Obter detalhes de uma viagem
 * @access  Private
 */
router.get('/:id', authenticate, tripsController.getTripById);

/**
 * @route   PATCH /api/trips/:id/start
 * @desc    Iniciar viagem (pickup)
 * @access  Private (TRANSPORTADOR)
 */
router.patch('/:id/start', authenticate, authorize('TRANSPORTADOR', 'ADMIN'), [
  body('lat').isFloat().withMessage('Latitude inválida'),
  body('lng').isFloat().withMessage('Longitude inválida'),
], tripsController.startTrip);

/**
 * @route   POST /api/trips/:id/location
 * @desc    Atualizar localização da viagem
 * @access  Private (TRANSPORTADOR)
 */
router.post('/:id/location', authenticate, authorize('TRANSPORTADOR', 'ADMIN'), [
  body('lat').isFloat().withMessage('Latitude inválida'),
  body('lng').isFloat().withMessage('Longitude inválida'),
], tripsController.updateLocation);

/**
 * @route   PATCH /api/trips/:id/complete
 * @desc    Completar viagem (delivery)
 * @access  Private (TRANSPORTADOR)
 */
router.patch('/:id/complete', authenticate, authorize('TRANSPORTADOR', 'ADMIN'), [
  body('lat').isFloat().withMessage('Latitude inválida'),
  body('lng').isFloat().withMessage('Longitude inválida'),
], tripsController.completeTrip);

/**
 * @route   PATCH /api/trips/:id/cancel
 * @desc    Cancelar viagem
 * @access  Private
 */
router.patch('/:id/cancel', authenticate, tripsController.cancelTrip);

/**
 * @route   GET /api/trips/:id/locations
 * @desc    Obter histórico de localizações
 * @access  Private
 */
router.get('/:id/locations', authenticate, tripsController.getTripLocations);

export default router;
