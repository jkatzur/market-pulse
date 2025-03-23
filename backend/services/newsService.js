import fetch from 'node-fetch';

const GNEWS_ENDPOINT = 'https://gnews.io/api/v4/search';

// Debug log
console.log('GNews API Key loaded:', process.env.GNEWS_API_KEY ? 'Yes' : 'No');
console.log('GNews API Key:', process.env.GNEWS_API_KEY);

// Keep track of last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 10000; // 10 seconds between requests

// Cache for news articles
let cachedNews = [];

const getLastTradingDay = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentHour = now.getHours();

  // If it's before 9:30 AM, get the previous trading day
  if (currentHour < 9 || (currentHour === 9 && now.getMinutes() < 30)) {
    now.setDate(now.getDate() - 1);
  }

  // If it's Sunday, go back to Friday
  if (currentDay === 0) {
    now.setDate(now.getDate() - 2);
  }
  // If it's Saturday, go back to Friday
  else if (currentDay === 6) {
    now.setDate(now.getDate() - 1);
  }

  const date = now.toISOString().split('T')[0];
  console.log('Last trading day:', date);
  return date;
};

export const getMarketNews = async () => {
  try {
    // Get API key from environment at request time
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      throw new Error('GNEWS_API_KEY environment variable is not set');
    }

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const lastTradingDay = getLastTradingDay();
    
    const url = new URL(GNEWS_ENDPOINT);
    url.searchParams.append('q', 'stock market OR "S&P 500" OR nasdaq OR "dow jones"');
    url.searchParams.append('lang', 'en');
    url.searchParams.append('country', 'us');
    url.searchParams.append('max', '10');
    url.searchParams.append('sortby', 'publishedAt');
    url.searchParams.append('apikey', apiKey);  // Use the API key from environment

    console.log('Fetching news with URL:', url.toString());

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limit hit, using cached news if available');
        return cachedNews;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw news data:', data);

    if (!data.articles || data.articles.length === 0) {
      console.warn('No articles found in response');
      return cachedNews;
    }

    // Filter for recent and relevant articles
    const filteredArticles = data.articles
      .filter(article => {
        const articleDate = new Date(article.publishedAt);
        const articleDateStr = articleDate.toISOString().split('T')[0];
        const isRecent = articleDateStr >= lastTradingDay;
        
        console.log('Article:', {
          title: article.title,
          date: articleDateStr,
          isRecent,
          lastTradingDay
        });

        return isRecent;
      })
      .slice(0, 10); // Ensure we don't get more than 10 articles

    console.log('Filtered articles:', filteredArticles);

    if (filteredArticles.length === 0) {
      console.warn('No articles passed the date filter');
      return cachedNews;
    }

    // Update the cache
    cachedNews = filteredArticles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      provider: article.source.name,
      datePublished: article.publishedAt,
      content: article.content
    }));

    lastRequestTime = Date.now();
    return cachedNews;

  } catch (error) {
    console.error('Error fetching news:', error);
    return cachedNews;
  }
}; 