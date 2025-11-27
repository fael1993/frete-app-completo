// ============================================
// Invoices Routes - Gestão de Faturas
// ============================================

import express from 'express';
import { body } from 'express-validator';
import * as invoicesController from '../controllers/invoices.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const createInvoiceValidation = [
  body('loadId').isUUID().withMessage('ID de carga inválido'),
  body('recipientId').isUUID().withMessage('ID de destinatário inválido'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal inválido'),
  body('platformFee').isFloat({ min: 0 }).withMessage('Taxa de plataforma inválida'),
  body('dueDate').isISO8601().withMessage('Data de vencimento inválida'),
];

/**
 * @route   GET /api/invoices
 * @desc    Listar faturas
 * @access  Private
 */
router.get('/', authenticate, invoicesController.getInvoices);

/**
 * @route   GET /api/invoices/stats
 * @desc    Obter estatísticas de faturas
 * @access  Private
 */
router.get('/stats', authenticate, invoicesController.getInvoiceStats);

/**
 * @route   GET /api/invoices/:id
 * @desc    Obter fatura por ID
 * @access  Private
 */
router.get('/:id', authenticate, invoicesController.getInvoiceById);

/**
 * @route   POST /api/invoices
 * @desc    Criar fatura
 * @access  Private (ADMIN)
 */
router.post('/', authenticate, authorize('ADMIN'), createInvoiceValidation, invoicesController.createInvoice);

/**
 * @route   POST /api/invoices/:id/pay
 * @desc    Processar pagamento de fatura
 * @access  Private
 */
router.post('/:id/pay', authenticate, [
  body('paymentMethod').isIn(['CREDIT_CARD', 'BANK_TRANSFER', 'STRIPE', 'PAYPAL']).withMessage('Método de pagamento inválido'),
], invoicesController.payInvoice);

/**
 * @route   PATCH /api/invoices/:id/cancel
 * @desc    Cancelar fatura
 * @access  Private (ADMIN)
 */
router.patch('/:id/cancel', authenticate, authorize('ADMIN'), invoicesController.cancelInvoice);

/**
 * @route   GET /api/invoices/:id/pdf
 * @desc    Download PDF da fatura
 * @access  Private
 */
router.get('/:id/pdf', authenticate, invoicesController.downloadInvoicePDF);

export default router;
