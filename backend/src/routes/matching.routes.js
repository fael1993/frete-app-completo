// ============================================
// Matching Routes (Busca e Sugestões)
// ============================================
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Search available carriers
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const { originLat, originLng, vehicleType, maxDistance = 100 } = req.body;

    // Simple matching: find carriers with available vehicles
    // In production, use PostGIS for geospatial queries
    const carriers = await prisma.user.findMany({
      where: {
        role: 'CARRIER',
        status: 'ACTIVE',
        vehicles: {
          some: {
            isActive: true,
            isAvailable: true,
            ...(vehicleType && { type: vehicleType }),
          },
        },
      },
      include: {
        profile: true,
        vehicles: {
          where: { isActive: true, isAvailable: true },
        },
      },
      take: 20,
    });

    res.json({ carriers });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Erro na busca' });
  }
});

module.exports = router;
