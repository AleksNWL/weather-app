import express from 'express';
import * as analyticsService from '../services/analyticsService.js';

const router = express.Router();

/**
 * GET /stats/cities
 * Статистика по всем городам
 */
router.get('/cities', async (req, res) => {
  try {
    const stats = await analyticsService.getCitiesStats();
    res.json(stats);
  } catch (err) {
    console.error('Cities stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /stats/city/:city
 * Подробная статистика по конкретному городу
 */
router.get('/city/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const days = parseInt(req.query.days) || 30;
    
    const stats = await analyticsService.getCityStats(city, days);
    res.json(stats);
  } catch (err) {
    console.error('City stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
