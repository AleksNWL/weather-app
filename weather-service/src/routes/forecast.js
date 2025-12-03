import express from 'express';
import * as weatherService from '../services/weatherService.js';

const router = express.Router();

/**
 * GET /forecast/:city
 * Get 5-day forecast for a city
 */
router.get('/:city', async (req, res) => {
  try {
    const forecast = await weatherService.getForecast(req.params.city);
    res.json(forecast);
  } catch (error) {
    console.error('Forecast route error:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении прогноза',
      details: error.message
    });
  }
});

export default router;
