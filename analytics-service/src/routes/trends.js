import express from 'express';
import * as analyticsService from '../services/analyticsService.js';

const router = express.Router();

/**
 * GET /trends/:city
 * Тренды температуры по дням для города
 */
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const days = parseInt(req.query.days) || 7;
    
    const trends = await analyticsService.getCityTrends(city, days);
    res.json(trends);
  } catch (err) {
    console.error('Trends error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
