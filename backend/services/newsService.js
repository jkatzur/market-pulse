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

function getStartDate() {
  // Get current UTC date
  const now = new Date();
  
  // Convert to ET by subtracting 4 hours (ET is UTC-4)
  const etDate = new Date(now.getTime() - (4 * 60 * 60 * 1000));
  
  const dayOfWeek = etDate.getDay();
  const hour = etDate.getHours();
  const minutes = etDate.getMinutes();
  const date = new Date(etDate);

  // Check if it's before market open (9:30am ET)
  const beforeMarketOpen = hour < 9 || (hour === 9 && minutes < 30);

  if (dayOfWeek === 0) { // Sunday
    date.setDate(date.getDate() - 2); // Go back to Friday
  } else if (dayOfWeek === 6) { // Saturday
    date.setDate(date.getDate() - 1); // Go back to Friday
  } else if (dayOfWeek === 1 && beforeMarketOpen) { // Monday before market open
    date.setDate(date.getDate() - 3); // Go back to Friday
  } else if (beforeMarketOpen) { // Any other day before market open
    date.setDate(date.getDate() - 1); // Go back one day
  }

  return date;
}

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

    const lastTradingDay = getStartDate().toISOString().split('T')[0];
    console.log('Date info:', {
      rawDate: getStartDate(),
      lastTradingDay,
      currentNYTime: new Date().toLocaleString("en-US", {timeZone: "America/New_York"}),
      fromParam: `${lastTradingDay}T00:00:00Z`
    });
    
    const url = new URL(GNEWS_ENDPOINT);
    url.searchParams.append('q', 'stock market OR "S&P 500" OR nasdaq OR "dow jones"');
    url.searchParams.append('lang', 'en');
    url.searchParams.append('country', 'us');
    url.searchParams.append('max', '10');
    url.searchParams.append('sortby', 'publishedAt');
    url.searchParams.append('from', `${lastTradingDay}T00:00:00Z`);
    url.searchParams.append('apikey', apiKey);  // Use the API key from environment

    console.log('Fetching news with URL:', url.toString());

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limit hit, using cached news if available');
        return cachedNews;
      }
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers)
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', {
      totalArticles: data.totalArticles,
      articlesReceived: data.articles?.length,
      firstArticle: data.articles?.[0],
      lastTradingDay
    });

    if (!data.articles || data.articles.length === 0) {
      console.warn('No articles found in response');
      return cachedNews;
    }

    // Update the cache
    cachedNews = data.articles.map(article => ({
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