import express from 'express';
import * as weatherService from '../services/weatherService.js';

const router = express.Router();

/**
 * GET /search/:query
 * Search cities with improved Russian language handling
 */
router.get('/:query', async (req, res) => {
  try {
    const results = await weatherService.searchCities(req.params.query);
    res.json(results);
  } catch (error) {
    console.error('Search route error:', error);
    res.status(500).json({ 
      error: 'Ошибка при поиске городов',
      details: error.message
    });
  }
});

export default router;
