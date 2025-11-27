// ============================================
// Ratings Controller - Gestão de Avaliações
// ============================================

import { validationResult } from 'express-validator';
import { prisma } from '../server.js';

/**
 * @desc    Criar avaliação
 * @route   POST /api/ratings
 * @access  Private
 */
export const createRating = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { toUserId, rating, comment, loadId } = req.body;
    
    // Não pode avaliar a si próprio
    if (toUserId === req.user.id) {
      return res.status(400).json({ error: 'Não pode avaliar-se a si próprio' });
    }
    
    // Verificar se já avaliou este utilizador para esta carga
    if (loadId) {
      const existingRating = await prisma.rating.findFirst({
        where: {
          fromUserId: req.user.id,
          toUserId,
          loadId,
        },
      });
      
      if (existingRating) {
        return res.status(409).json({ error: 'Já avaliou este utilizador para esta carga' });
      }
    }
    
    // Criar avaliação
    const newRating = await prisma.rating.create({
      data: {
        fromUserId: req.user.id,
        toUserId,
        rating,
        comment,
        loadId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    });
    
    // Atualizar rating médio do utilizador avaliado
    const ratings = await prisma.rating.findMany({
      where: { toUserId },
      select: { rating: true },
    });
    
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await prisma.user.update({
      where: { id: toUserId },
      data: {
        rating: avgRating,
        totalRatings: ratings.length,
      },
    });
    
    res.status(201).json({
      message: 'Avaliação criada com sucesso',
      rating: newRating,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Listar avaliações de um utilizador
 * @route   GET /api/ratings/user/:userId
 * @access  Public
 */
export const getUserRatings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where: { toUserId: userId },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          fromUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.rating.count({ where: { toUserId: userId } }),
    ]);
    
    res.json({
      ratings,
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
 * @desc    Listar avaliações dadas pelo utilizador
 * @route   GET /api/ratings/my/given
 * @access  Private
 */
export const getMyGivenRatings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where: { fromUserId: req.user.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          toUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.rating.count({ where: { fromUserId: req.user.id } }),
    ]);
    
    res.json({
      ratings,
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
 * @desc    Atualizar avaliação
 * @route   PUT /api/ratings/:id
 * @access  Private (Owner)
 */
export const updateRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const existingRating = await prisma.rating.findUnique({
      where: { id },
    });
    
    if (!existingRating) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }
    
    if (existingRating.fromUserId !== req.user.id) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    const updatedRating = await prisma.rating.update({
      where: { id },
      data: { rating, comment },
    });
    
    // Recalcular rating médio
    const ratings = await prisma.rating.findMany({
      where: { toUserId: existingRating.toUserId },
      select: { rating: true },
    });
    
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await prisma.user.update({
      where: { id: existingRating.toUserId },
      data: { rating: avgRating },
    });
    
    res.json({
      message: 'Avaliação atualizada',
      rating: updatedRating,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar avaliação
 * @route   DELETE /api/ratings/:id
 * @access  Private (Owner ou ADMIN)
 */
export const deleteRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const rating = await prisma.rating.findUnique({
      where: { id },
    });
    
    if (!rating) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }
    
    if (rating.fromUserId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    await prisma.rating.delete({ where: { id } });
    
    // Recalcular rating médio
    const ratings = await prisma.rating.findMany({
      where: { toUserId: rating.toUserId },
      select: { rating: true },
    });
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
    
    await prisma.user.update({
      where: { id: rating.toUserId },
      data: {
        rating: avgRating,
        totalRatings: ratings.length,
      },
    });
    
    res.json({ message: 'Avaliação eliminada' });
  } catch (error) {
    next(error);
  }
};
