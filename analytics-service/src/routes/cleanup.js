import express from 'express';
import * as analyticsService from '../services/analyticsService.js';

const router = express.Router();

/**
 * DELETE /cleanup/old
 * Удалить старые записи старше N дней
 */
router.delete('/old', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    const deletedCount = await analyticsService.deleteOldRecords(days);
    
    res.json({
      message: `Deleted ${deletedCount} old records`,
      deletedCount
    });
  } catch (err) {
    console.error('Cleanup old records error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /cleanup/null-cities
 * Удалить записи с пустыми названиями городов
 */
router.delete('/null-cities', async (req, res) => {
  try {
    const deletedCount = await analyticsService.deleteNullCities();
    
    res.json({
      message: `Deleted ${deletedCount} records with null cities`,
      deletedCount
    });
  } catch (err) {
    console.error('Cleanup null cities error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /cleanup/fix-null-cities
 * Исправить записи с пустыми названиями городов используя originalQuery
 */
router.post('/fix-null-cities', async (req, res) => {
  try {
    const updatedCount = await analyticsService.fixNullCities();
    
    res.json({
      message: `Updated ${updatedCount} records`,
      updated: updatedCount
    });
  } catch (err) {
    console.error('Fix null cities error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
