// ============================================
// Users Controller - Gestão de Utilizadores
// ============================================

import { validationResult } from 'express-validator';
import { prisma } from '../server.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Listar utilizadores (Admin)
 * @route   GET /api/users
 * @access  Private (ADMIN)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 20, search } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      ...(role && { role }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          phone: true,
          companyName: true,
          country: true,
          rating: true,
          totalRatings: true,
          completedTrips: true,
          emailVerified: true,
          phoneVerified: true,
          documentsVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    
    res.json({
      users,
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
 * @desc    Obter utilizador por ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        avatar: true,
        fiscalNumber: true,
        companyName: true,
        companyAddress: true,
        country: true,
        language: true,
        rating: true,
        totalRatings: true,
        completedTrips: true,
        emailVerified: true,
        phoneVerified: true,
        documentsVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            loadsAsShipper: true,
            offers: true,
            tripsAsCarrier: true,
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Atualizar perfil do utilizador
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      firstName,
      lastName,
      phone,
      avatar,
      companyName,
      companyAddress,
      country,
      language,
    } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        avatar,
        companyName,
        companyAddress,
        country,
        language,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        avatar: true,
        companyName: true,
        companyAddress: true,
        country: true,
        language: true,
      },
    });
    
    res.json({
      message: 'Perfil atualizado com sucesso',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Atualizar status do utilizador (Admin)
 * @route   PATCH /api/users/:id/status
 * @access  Private (ADMIN)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['PENDING', 'ACTIVE', 'SUSPENDED', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });
    
    res.json({
      message: 'Status atualizado com sucesso',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verificar documentos do utilizador (Admin)
 * @route   PATCH /api/users/:id/verify-documents
 * @access  Private (ADMIN)
 */
export const verifyUserDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        documentsVerified: verified,
        status: verified ? 'ACTIVE' : 'PENDING',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        documentsVerified: true,
        status: true,
      },
    });
    
    res.json({
      message: verified ? 'Documentos verificados com sucesso' : 'Verificação removida',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar conta (própria ou Admin)
 * @route   DELETE /api/users/:id
 * @access  Private
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar permissão
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    // Verificar se tem cargas ou viagens ativas
    const activeLoads = await prisma.load.count({
      where: {
        shipperId: id,
        status: { in: ['PUBLISHED', 'IN_NEGOTIATION', 'ACCEPTED', 'IN_TRANSIT'] },
      },
    });
    
    if (activeLoads > 0) {
      return res.status(400).json({
        error: 'Não é possível eliminar conta com cargas ativas',
      });
    }
    
    await prisma.user.delete({ where: { id } });
    
    res.json({ message: 'Conta eliminada com sucesso' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obter estatísticas do utilizador
 * @route   GET /api/users/stats
 * @access  Private
 */
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [loadsCount, offersCount, tripsCount, ratings] = await Promise.all([
      prisma.load.count({ where: { shipperId: userId } }),
      prisma.offer.count({ where: { carrierId: userId } }),
      prisma.trip.count({ where: { carrierId: userId } }),
      prisma.rating.findMany({
        where: { toUserId: userId },
        select: { rating: true },
      }),
    ]);
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
    
    res.json({
      loads: loadsCount,
      offers: offersCount,
      trips: tripsCount,
      rating: avgRating,
      totalRatings: ratings.length,
    });
  } catch (error) {
    next(error);
  }
};
