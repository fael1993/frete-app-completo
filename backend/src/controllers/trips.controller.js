// ============================================
// Trips Controller - Gestão de Viagens
// ============================================

import { validationResult } from 'express-validator';
import { prisma } from '../server.js';

/**
 * @desc    Listar viagens
 * @route   GET /api/trips
 * @access  Private
 */
export const getTrips = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      ...(req.user.role === 'TRANSPORTADOR' && { carrierId: req.user.id }),
      ...(status && status !== 'ALL' && { status }),
    };
    
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
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
              pickupDate: true,
              deliveryDate: true,
            },
          },
          carrier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              phone: true,
            },
          },
          vehicle: true,
        },
      }),
      prisma.trip.count({ where }),
    ]);
    
    res.json({
      trips,
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
 * @desc    Obter detalhes de uma viagem
 * @route   GET /api/trips/:id
 * @access  Private
 */
export const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        load: {
          include: {
            shipper: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        carrier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            phone: true,
            email: true,
          },
        },
        vehicle: true,
        locations: {
          orderBy: { recordedAt: 'desc' },
          take: 50,
        },
      },
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }
    
    res.json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Iniciar viagem (pickup)
 * @route   PATCH /api/trips/:id/start
 * @access  Private (Carrier)
 */
export const startTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng, pickupChecklist } = req.body;
    
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { load: true },
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }
    
    if (trip.carrierId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (trip.status !== 'SCHEDULED') {
      return res.status(400).json({ error: 'Viagem não está agendada' });
    }
    
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        actualPickupTime: new Date(),
        currentLat: lat,
        currentLng: lng,
        lastLocationUpdate: new Date(),
        pickupChecklist,
        load: {
          update: {
            status: 'IN_TRANSIT',
          },
        },
      },
    });
    
    // Criar primeiro ponto de localização
    if (lat && lng) {
      await prisma.location.create({
        data: {
          tripId: id,
          lat,
          lng,
        },
      });
    }
    
    res.json({
      message: 'Viagem iniciada com sucesso',
      trip: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Atualizar localização da viagem
 * @route   POST /api/trips/:id/location
 * @access  Private (Carrier)
 */
export const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng, speed, heading, accuracy } = req.body;
    
    const trip = await prisma.trip.findUnique({ where: { id } });
    
    if (!trip) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }
    
    if (trip.carrierId !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (trip.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Viagem não está em progresso' });
    }
    
    // Atualizar localização atual da viagem
    await prisma.trip.update({
      where: { id },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastLocationUpdate: new Date(),
      },
    });
    
    // Criar ponto de localização
    const location = await prisma.location.create({
      data: {
        tripId: id,
        lat,
        lng,
        speed,
        heading,
        accuracy,
      },
    });
    
    res.json({
      message: 'Localização atualizada',
      location,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Completar viagem (delivery)
 * @route   PATCH /api/trips/:id/complete
 * @access  Private (Carrier)
 */
export const completeTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng, deliveryChecklist, podSignature, podPhoto, podNotes } = req.body;
    
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { load: true },
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }
    
    if (trip.carrierId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (trip.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Viagem não está em progresso' });
    }
    
    const updatedTrip = await prisma.$transaction(async (tx) => {
      // Atualizar viagem
      const trip = await tx.trip.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          actualDeliveryTime: new Date(),
          completedAt: new Date(),
          currentLat: lat,
          currentLng: lng,
          lastLocationUpdate: new Date(),
          deliveryChecklist,
          podSignature,
          podPhoto,
          podNotes,
        },
      });
      
      // Atualizar carga
      await tx.load.update({
        where: { id: trip.loadId },
        data: { status: 'DELIVERED' },
      });
      
      // Atualizar contador de viagens do transportador
      await tx.user.update({
        where: { id: trip.carrierId },
        data: {
          completedTrips: { increment: 1 },
        },
      });
      
      return trip;
    });
    
    // Criar último ponto de localização
    if (lat && lng) {
      await prisma.location.create({
        data: {
          tripId: id,
          lat,
          lng,
        },
      });
    }
    
    res.json({
      message: 'Viagem completada com sucesso',
      trip: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancelar viagem
 * @route   PATCH /api/trips/:id/cancel
 * @access  Private
 */
export const cancelTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { load: true },
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }
    
    // Apenas carrier ou shipper podem cancelar
    if (trip.carrierId !== req.user.id && trip.load.shipperId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (trip.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Não é possível cancelar viagem completada' });
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
      
      await tx.load.update({
        where: { id: trip.loadId },
        data: { status: 'CANCELLED' },
      });
    });
    
    res.json({ message: 'Viagem cancelada' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obter histórico de localizações
 * @route   GET /api/trips/:id/locations
 * @access  Private
 */
export const getTripLocations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;
    
    const locations = await prisma.location.findMany({
      where: { tripId: id },
      orderBy: { recordedAt: 'desc' },
      take: parseInt(limit),
    });
    
    res.json(locations);
  } catch (error) {
    next(error);
  }
};
