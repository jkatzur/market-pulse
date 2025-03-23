import express from 'express';
import { getMarketNews } from '../services/newsService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const news = await getMarketNews();
    res.json(news);
  } catch (error) {
    console.error('Full error details:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router; 