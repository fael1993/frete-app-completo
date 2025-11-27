// ============================================
// Loads Controller - Lógica de Cargas
// ============================================

import { validationResult } from 'express-validator';
import { prisma } from '../server.js';
import { calculateDistance, geocodeAddress } from '../services/geocoding.service.js';
import { calculateFreightPrice } from '../services/freight.service.js';

/**
 * @desc    Listar cargas com filtros
 * @route   GET /api/loads
 * @access  Public
 */
export const getLoads = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      originCountry,
      destCountry,
      loadType,
      minWeight,
      maxWeight,
      status = 'PUBLISHED',
      page = 1,
      limit = 20,
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construir filtros
    const where = {
      status: status === 'ALL' ? undefined : status,
      ...(originCountry && { originCountry }),
      ...(destCountry && { destCountry }),
      ...(loadType && { loadType }),
      ...(minWeight && { weight: { gte: parseFloat(minWeight) } }),
      ...(maxWeight && { weight: { lte: parseFloat(maxWeight) } }),
    };
    
    // Buscar cargas
    const [loads, total] = await Promise.all([
      prisma.load.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          shipper: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              rating: true,
              totalRatings: true,
            },
          },
          _count: {
            select: { offers: true },
          },
        },
      }),
      prisma.load.count({ where }),
    ]);
    
    res.json({
      loads,
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
 * @desc    Obter detalhes de uma carga
 * @route   GET /api/loads/:id
 * @access  Public
 */
export const getLoadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const load = await prisma.load.findUnique({
      where: { id },
      include: {
        shipper: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            rating: true,
            totalRatings: true,
            phone: true,
            email: true,
          },
        },
        offers: {
          where: { status: 'PENDING' },
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
          },
          orderBy: { price: 'asc' },
        },
        trip: {
          include: {
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
        },
      },
    });
    
    if (!load) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    res.json(load);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Criar nova carga
 * @route   POST /api/loads
 * @access  Private (EMBARCADOR)
 */
export const createLoad = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      originAddress,
      originCity,
      originPostalCode,
      originCountry,
      destAddress,
      destCity,
      destPostalCode,
      destCountry,
      loadType,
      weight,
      volume,
      length,
      width,
      height,
      pallets,
      title,
      description,
      specialRequirements,
      pickupDate,
      pickupTimeStart,
      pickupTimeEnd,
      deliveryDate,
      deliveryTimeStart,
      deliveryTimeEnd,
      suggestedPrice,
      minPrice,
      maxPrice,
      requiredVehicleType,
      requiresInsurance,
      requiresCMR,
      requiresADR,
      images,
      documents,
    } = req.body;
    
    // Geocoding (obter coordenadas)
    let originCoords, destCoords, distance, estimatedDuration;
    
    try {
      originCoords = await geocodeAddress(`${originAddress}, ${originCity}, ${originPostalCode}, ${originCountry}`);
      destCoords = await geocodeAddress(`${destAddress}, ${destCity}, ${destPostalCode}, ${destCountry}`);
      
      // Calcular distância
      const distanceData = await calculateDistance(originCoords, destCoords);
      distance = distanceData.distance;
      estimatedDuration = distanceData.duration;
    } catch (geoError) {
      console.error('Erro no geocoding:', geoError);
      // Continuar sem coordenadas (opcional)
    }
    
    // Calcular preço sugerido se não fornecido
    if (!suggestedPrice && distance) {
      const calculatedPrice = calculateFreightPrice({
        distance,
        weight,
        loadType,
        originCountry,
        destCountry,
      });
      req.body.suggestedPrice = calculatedPrice;
    }
    
    // Criar carga
    const load = await prisma.load.create({
      data: {
        shipperId: req.user.id,
        status: 'DRAFT',
        originAddress,
        originCity,
        originPostalCode,
        originCountry,
        originLat: originCoords?.lat,
        originLng: originCoords?.lng,
        destAddress,
        destCity,
        destPostalCode,
        destCountry,
        destLat: destCoords?.lat,
        destLng: destCoords?.lng,
        distance,
        estimatedDuration,
        loadType,
        weight,
        volume,
        length,
        width,
        height,
        pallets,
        title,
        description,
        specialRequirements,
        pickupDate: new Date(pickupDate),
        pickupTimeStart,
        pickupTimeEnd,
        deliveryDate: new Date(deliveryDate),
        deliveryTimeStart,
        deliveryTimeEnd,
        suggestedPrice: req.body.suggestedPrice || suggestedPrice,
        minPrice,
        maxPrice,
        requiredVehicleType,
        requiresInsurance,
        requiresCMR,
        requiresADR,
        images: images || [],
        documents: documents || [],
      },
      include: {
        shipper: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    });
    
    res.status(201).json({
      message: 'Carga criada com sucesso',
      load,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Atualizar carga
 * @route   PUT /api/loads/:id
 * @access  Private (Owner)
 */
export const updateLoad = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se carga existe e pertence ao utilizador
    const existingLoad = await prisma.load.findUnique({
      where: { id },
    });
    
    if (!existingLoad) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    if (existingLoad.shipperId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão para editar esta carga' });
    }
    
    // Não permitir edição se já aceite ou em trânsito
    if (['ACCEPTED', 'IN_TRANSIT', 'DELIVERED'].includes(existingLoad.status)) {
      return res.status(400).json({ error: 'Não é possível editar carga neste estado' });
    }
    
    // Atualizar carga
    const load = await prisma.load.update({
      where: { id },
      data: req.body,
    });
    
    res.json({
      message: 'Carga atualizada com sucesso',
      load,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publicar carga
 * @route   PATCH /api/loads/:id/publish
 * @access  Private (Owner)
 */
export const publishLoad = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const load = await prisma.load.findUnique({ where: { id } });
    
    if (!load) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    if (load.shipperId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (load.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Apenas rascunhos podem ser publicados' });
    }
    
    const updatedLoad = await prisma.load.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
    });
    
    // TODO: Notificar transportadores compatíveis
    
    res.json({
      message: 'Carga publicada com sucesso',
      load: updatedLoad,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancelar carga
 * @route   PATCH /api/loads/:id/cancel
 * @access  Private (Owner)
 */
export const cancelLoad = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const load = await prisma.load.findUnique({ where: { id } });
    
    if (!load) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    if (load.shipperId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (['DELIVERED', 'CANCELLED'].includes(load.status)) {
      return res.status(400).json({ error: 'Não é possível cancelar carga neste estado' });
    }
    
    const updatedLoad = await prisma.load.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    
    // TODO: Notificar transportador se já aceite
    
    res.json({
      message: 'Carga cancelada com sucesso',
      load: updatedLoad,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar carga
 * @route   DELETE /api/loads/:id
 * @access  Private (Owner)
 */
export const deleteLoad = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const load = await prisma.load.findUnique({ where: { id } });
    
    if (!load) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    if (load.shipperId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    if (load.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Apenas rascunhos podem ser eliminados' });
    }
    
    await prisma.load.delete({ where: { id } });
    
    res.json({ message: 'Carga eliminada com sucesso' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Listar cargas do utilizador
 * @route   GET /api/loads/my/loads
 * @access  Private
 */
export const getMyLoads = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      shipperId: req.user.id,
      ...(status && status !== 'ALL' && { status }),
    };
    
    const [loads, total] = await Promise.all([
      prisma.load.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { offers: true },
          },
          trip: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
      prisma.load.count({ where }),
    ]);
    
    res.json({
      loads,
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
