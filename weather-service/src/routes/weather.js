import express from 'express';
import * as weatherService from '../services/weatherService.js';

const router = express.Router();

/**
 * GET /weather/:city
 * Get current weather for a city
 */
router.get('/:city', async (req, res) => {
  try {
    const weatherData = await weatherService.getWeatherByCity(req.params.city);
    res.json(weatherData);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json(error);
    }
    console.error('Weather route error:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении данных о погоде',
      details: error.message
    });
  }
});

/**
 * GET /weather/coordinates/:lat/:lon
 * Get weather by coordinates
 */
router.get('/coordinates/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const weatherData = await weatherService.getWeatherByCoordinates(lat, lon);
    res.json(weatherData);
  } catch (error) {
    console.error('Weather by coordinates route error:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении погоды по координатам',
      details: error.message
    });
  }
});

export default router;
