import express from 'express';
import * as analyticsService from '../services/analyticsService.js';

const router = express.Router();

/**
 * POST /history
 * Добавить новую запись в историю
 */
router.post('/', async (req, res) => {
  try {
    const entry = await analyticsService.addHistoryEntry(req.body);
    res.status(201).json(entry);
  } catch (err) {
    console.error('History POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /history
 * Получить всю историю с пагинацией
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await analyticsService.getHistory(page, limit);
    res.json(result);
  } catch (err) {
    console.error('History GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
