import express from 'express';
import { getMarketNews } from '../services/newsService.js';
import { newsCache } from '../services/cacheService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Check cache first
    const cachedNews = newsCache.get('latest');
    if (cachedNews) {
      console.log('Returning cached news data');
      return res.json(cachedNews);
    }

    // If no cache, fetch new data
    const news = await getMarketNews();
    
    // Store in cache
    if (news && news.length > 0) {
      newsCache.set('latest', news);
    }

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