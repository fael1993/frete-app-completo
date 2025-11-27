// ============================================
// Invoices Controller - Gestão de Faturas
// ============================================

import { validationResult } from 'express-validator';
import { prisma } from '../server.js';
import { generateInvoiceNumber, generateInvoicePDF } from '../services/invoice.service.js';
import { processPayment } from '../services/payment.service.js';

/**
 * @desc    Listar faturas
 * @route   GET /api/invoices
 * @access  Private
 */
export const getInvoices = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      OR: [
        { issuerId: req.user.id },
        { recipientId: req.user.id },
      ],
      ...(status && status !== 'ALL' && { status }),
    };
    
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          load: {
            select: {
              id: true,
              title: true,
              originCity: true,
              destCity: true,
            },
          },
          issuer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);
    
    res.json({
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obter fatura por ID
 * @route   GET /api/invoices/:id
 * @access  Private
 */
export const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        load: true,
        issuer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyName: true,
            companyAddress: true,
            fiscalNumber: true,
            country: true,
          },
        },
        recipient: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyName: true,
            companyAddress: true,
            fiscalNumber: true,
            country: true,
          },
        },
      },
    });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }
    
    // Verificar permissão
    if (invoice.issuerId !== req.user.id && invoice.recipientId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Criar fatura
 * @route   POST /api/invoices
 * @access  Private (ADMIN ou sistema automático)
 */
export const createInvoice = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { loadId, recipientId, subtotal, platformFee, dueDate } = req.body;
    
    // Verificar se carga existe
    const load = await prisma.load.findUnique({
      where: { id: loadId },
    });
    
    if (!load) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    // Verificar se já existe fatura para esta carga
    const existingInvoice = await prisma.invoice.findUnique({
      where: { loadId },
    });
    
    if (existingInvoice) {
      return res.status(409).json({ error: 'Já existe fatura para esta carga' });
    }
    
    // Calcular valores
    const vatRate = 23; // IVA Portugal (pode ser dinâmico por país)
    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount + platformFee;
    
    // Gerar número de fatura
    const invoiceNumber = await generateInvoiceNumber();
    
    // Criar fatura
    const invoice = await prisma.invoice.create({
      data: {
        loadId,
        issuerId: req.user.id,
        recipientId,
        status: 'ISSUED',
        subtotal,
        vatRate,
        vatAmount,
        platformFee,
        total,
        invoiceNumber,
        issueDate: new Date(),
        dueDate: new Date(dueDate),
      },
      include: {
        load: true,
        issuer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    });
    
    // Gerar PDF (assíncrono)
    generateInvoicePDF(invoice).catch(err => console.error('Erro ao gerar PDF:', err));
    
    res.status(201).json({
      message: 'Fatura criada com sucesso',
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Processar pagamento de fatura
 * @route   POST /api/invoices/:id/pay
 * @access  Private
 */
export const payInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentToken } = req.body;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        load: true,
        recipient: true,
      },
    });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }
    
    // Verificar se é o destinatário
    if (invoice.recipientId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (invoice.status === 'PAID') {
      return res.status(400).json({ error: 'Fatura já paga' });
    }
    
    if (invoice.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Fatura cancelada' });
    }
    
    try {
      // Processar pagamento via Stripe
      const paymentResult = await processPayment({
        amount: invoice.total,
        currency: 'EUR',
        paymentMethod,
        paymentToken,
        metadata: {
          invoiceId: invoice.id,
          loadId: invoice.loadId,
          userId: req.user.id,
        },
      });
      
      // Atualizar fatura
      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentMethod,
          paymentReference: paymentResult.paymentIntentId,
        },
      });
      
      res.json({
        message: 'Pagamento processado com sucesso',
        invoice: updatedInvoice,
        payment: paymentResult,
      });
    } catch (paymentError) {
      return res.status(400).json({
        error: 'Erro ao processar pagamento',
        message: paymentError.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancelar fatura
 * @route   PATCH /api/invoices/:id/cancel
 * @access  Private (ADMIN)
 */
export const cancelInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }
    
    if (invoice.status === 'PAID') {
      return res.status(400).json({ error: 'Não é possível cancelar fatura paga' });
    }
    
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    
    res.json({
      message: 'Fatura cancelada',
      invoice: updatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download PDF da fatura
 * @route   GET /api/invoices/:id/pdf
 * @access  Private
 */
export const downloadInvoicePDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        load: true,
        issuer: true,
        recipient: true,
      },
    });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Fatura não encontrada' });
    }
    
    // Verificar permissão
    if (invoice.issuerId !== req.user.id && invoice.recipientId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    // Se PDF já existe, retornar URL
    if (invoice.pdfUrl) {
      return res.json({ pdfUrl: invoice.pdfUrl });
    }
    
    // Gerar PDF
    const pdfUrl = await generateInvoicePDF(invoice);
    
    // Atualizar fatura com URL do PDF
    await prisma.invoice.update({
      where: { id },
      data: { pdfUrl },
    });
    
    res.json({ pdfUrl });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obter estatísticas de faturas
 * @route   GET /api/invoices/stats
 * @access  Private
 */
export const getInvoiceStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [issued, received, paid, overdue] = await Promise.all([
      prisma.invoice.aggregate({
        where: { issuerId: userId },
        _sum: { total: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { recipientId: userId },
        _sum: { total: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: {
          recipientId: userId,
          status: 'PAID',
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.invoice.count({
        where: {
          recipientId: userId,
          status: 'OVERDUE',
        },
      }),
    ]);
    
    res.json({
      issued: {
        count: issued._count,
        total: issued._sum.total || 0,
      },
      received: {
        count: received._count,
        total: received._sum.total || 0,
      },
      paid: {
        count: paid._count,
        total: paid._sum.total || 0,
      },
      overdue: overdue,
    });
  } catch (error) {
    next(error);
  }
};
