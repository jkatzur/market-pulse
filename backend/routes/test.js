import express from 'express';
import { getMarketData, getIntradayData } from '../services/marketService.js';
import { getMarketNews } from '../services/newsService.js';
import { analyzeMarketNews } from '../services/llmService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Test market data
    const marketData = await getMarketData();
    console.log('Market data test:', marketData);

    // Test intraday data
    const sp500Data = await getIntradayData('sp500');
    console.log('Intraday data test:', sp500Data.length, 'points');

    // Test news
    const news = await getMarketNews();
    console.log('News test:', news.length, 'articles');

    // Test LLM if we have news
    let analysis = null;
    if (news.length > 0) {
      analysis = await analyzeMarketNews(news, 'up');
      console.log('LLM test:', analysis.substring(0, 100) + '...');
    }

    res.json({
      status: 'success',
      tests: {
        marketData: !!marketData,
        intradayData: sp500Data.length > 0,
        news: news.length > 0,
        llm: !!analysis
      }
    });

  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 