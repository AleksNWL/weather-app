import express from 'express';
import * as weatherService from '../services/weatherService.js';

const router = express.Router();

/**
 * GET /geocode/:city
 * Geocode city name to coordinates
 */
router.get('/:city', async (req, res) => {
  try {
    const results = await weatherService.geocodeCity(req.params.city);
    res.json(results);
  } catch (error) {
    console.error('Geocode route error:', error);
    res.status(500).json({ 
      error: 'Geocoding failed',
      details: error.message
    });
  }
});

export default router;
