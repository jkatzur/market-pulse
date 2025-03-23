import express from 'express';
import { analyzeMarketNews } from '../services/llmService.js';
import { analysisCache } from '../services/cacheService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { articles, marketDirection } = req.body;
    
    // Create a cache key based on the request
    const cacheKey = `${marketDirection}-${articles.length}`;
    
    // Check cache first
    const cachedAnalysis = analysisCache.get(cacheKey);
    if (cachedAnalysis) {
      console.log('Returning cached analysis');
      return res.json({ analysis: cachedAnalysis });
    }

    // If no cache, perform analysis
    const analysis = await analyzeMarketNews(articles, marketDirection);
    
    // Store in cache
    if (analysis) {
      analysisCache.set(cacheKey, analysis);
    }

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 