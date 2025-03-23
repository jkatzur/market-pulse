import express from 'express';
import { analyzeMarketNews } from '../services/llmService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { articles, marketDirection } = req.body;
    const analysis = await analyzeMarketNews(articles, marketDirection);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 