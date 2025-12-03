import express from 'express';
import * as analyticsService from '../services/analyticsService.js';

const router = express.Router();

/**
 * GET /popular
 * Получить популярные города
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const popular = await analyticsService.getPopularCities(limit);
    res.json(popular);
  } catch (err) {
    console.error('Popular cities error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
