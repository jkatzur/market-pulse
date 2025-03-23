import express from 'express';
import { getMarketData, getIntradayData } from '../services/marketService.js';

const router = express.Router();

router.get('/data', async (req, res) => {
  try {
    const data = await getMarketData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/intraday/:index', async (req, res) => {
  try {
    const data = await getIntradayData(req.params.index);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 