// ============================================
// Offers Controller - Lógica de Propostas
// ============================================

import { validationResult } from 'express-validator';
import { prisma } from '../server.js';

/**
 * @desc    Criar proposta para uma carga
 * @route   POST /api/offers
 * @access  Private (TRANSPORTADOR)
 */
export const createOffer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { loadId, price, estimatedPickup, estimatedDelivery, message } = req.body;
    
    // Verificar se carga existe e está publicada
    const load = await prisma.load.findUnique({ where: { id: loadId } });
    
    if (!load) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    if (load.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'Carga não está disponível para propostas' });
    }
    
    // Não permitir proposta na própria carga
    if (load.shipperId === req.user.id) {
      return res.status(400).json({ error: 'Não pode fazer proposta na sua própria carga' });
    }
    
    // Verificar se já existe proposta pendente deste transportador
    const existingOffer = await prisma.offer.findFirst({
      where: {
        loadId,
        carrierId: req.user.id,
        status: 'PENDING',
      },
    });
    
    if (existingOffer) {
      return res.status(409).json({ error: 'Já tem uma proposta pendente para esta carga' });
    }
    
    // Criar proposta
    const offer = await prisma.offer.create({
      data: {
        loadId,
        carrierId: req.user.id,
        price,
        estimatedPickup: new Date(estimatedPickup),
        estimatedDelivery: new Date(estimatedDelivery),
        message,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
      },
      include: {
        carrier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            rating: true,
            totalRatings: true,
          },
        },
        load: {
          select: {
            id: true,
            title: true,
            originCity: true,
            destCity: true,
          },
        },
      },
    });
    
    // TODO: Notificar embarcador
    
    res.status(201).json({
      message: 'Proposta enviada com sucesso',
      offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Listar propostas de uma carga
 * @route   GET /api/offers/load/:loadId
 * @access  Private (Owner da carga)
 */
export const getOffersByLoad = async (req, res, next) => {
  try {
    const { loadId } = req.params;
    
    // Verificar se carga pertence ao utilizador
    const load = await prisma.load.findUnique({
      where: { id: loadId },
    });
    
    if (!load) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    if (load.shipperId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    const offers = await prisma.offer.findMany({
      where: { loadId },
      include: {
        carrier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            rating: true,
            totalRatings: true,
            completedTrips: true,
          },
        },
      },
      orderBy: { price: 'asc' },
    });
    
    res.json(offers);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Listar propostas do transportador
 * @route   GET /api/offers/my/offers
 * @access  Private (TRANSPORTADOR)
 */
export const getMyOffers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      carrierId: req.user.id,
      ...(status && status !== 'ALL' && { status }),
    };
    
    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
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
              originCountry: true,
              destCity: true,
              destCountry: true,
              weight: true,
              loadType: true,
              pickupDate: true,
              deliveryDate: true,
              status: true,
            },
          },
        },
      }),
      prisma.offer.count({ where }),
    ]);
    
    res.json({
      offers,
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
 * @desc    Aceitar proposta
 * @route   PATCH /api/offers/:id/accept
 * @access  Private (Owner da carga)
 */
export const acceptOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        load: true,
        carrier: true,
      },
    });
    
    if (!offer) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }
    
    // Verificar permissão
    if (offer.load.shipperId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (offer.status !== 'PENDING') {
      return res.status(400).json({ error: 'Proposta não está pendente' });
    }
    
    if (offer.load.status !== 'PUBLISHED' && offer.load.status !== 'IN_NEGOTIATION') {
      return res.status(400).json({ error: 'Carga não está disponível' });
    }
    
    // Aceitar proposta e rejeitar outras
    await prisma.$transaction(async (tx) => {
      // Aceitar esta proposta
      await tx.offer.update({
        where: { id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });
      
      // Rejeitar outras propostas pendentes
      await tx.offer.updateMany({
        where: {
          loadId: offer.loadId,
          id: { not: id },
          status: 'PENDING',
        },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
        },
      });
      
      // Atualizar carga
      await tx.load.update({
        where: { id: offer.loadId },
        data: {
          status: 'ACCEPTED',
          finalPrice: offer.price,
        },
      });
      
      // Criar viagem
      // Nota: Requer vehicleId do transportador
      const vehicle = await tx.vehicle.findFirst({
        where: {
          userId: offer.carrierId,
          isActive: true,
          isAvailable: true,
        },
      });
      
      if (vehicle) {
        await tx.trip.create({
          data: {
            loadId: offer.loadId,
            carrierId: offer.carrierId,
            vehicleId: vehicle.id,
            status: 'SCHEDULED',
          },
        });
      }
    });
    
    // TODO: Notificar transportador e outros
    
    res.json({
      message: 'Proposta aceite com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Rejeitar proposta
 * @route   PATCH /api/offers/:id/reject
 * @access  Private (Owner da carga)
 */
export const rejectOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { load: true },
    });
    
    if (!offer) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }
    
    if (offer.load.shipperId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (offer.status !== 'PENDING') {
      return res.status(400).json({ error: 'Proposta não está pendente' });
    }
    
    await prisma.offer.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
    });
    
    // TODO: Notificar transportador
    
    res.json({ message: 'Proposta rejeitada' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancelar proposta
 * @route   DELETE /api/offers/:id
 * @access  Private (Owner da proposta)
 */
export const cancelOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const offer = await prisma.offer.findUnique({ where: { id } });
    
    if (!offer) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }
    
    if (offer.carrierId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (offer.status !== 'PENDING') {
      return res.status(400).json({ error: 'Apenas propostas pendentes podem ser canceladas' });
    }
    
    await prisma.offer.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    
    res.json({ message: 'Proposta cancelada' });
  } catch (error) {
    next(error);
  }
};
