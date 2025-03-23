const GNEWS_ENDPOINT = 'https://gnews.io/api/v4/search';
const GNEWS_API_KEY = process.env.REACT_APP_GNEWS_API_KEY;

// Keep track of last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 10000; // 10 seconds between requests

export const getMarketNews = async () => {
  try {
    // Check if we need to wait
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const response = await fetch(
      `${GNEWS_ENDPOINT}?q=stock market OR wall street&lang=en&country=us&max=10&sortby=publishedAt&apikey=${GNEWS_API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limit hit, using cached news if available');
        // Return cached news if we have it
        return window.cachedNews || [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('News data:', data);

    // Cache the successful response
    window.cachedNews = data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      provider: article.source.name,
      datePublished: article.publishedAt,
      content: article.content
    }));

    // Update last request time
    lastRequestTime = Date.now();

    return window.cachedNews;

  } catch (error) {
    console.error('Error fetching news:', error);
    // Return cached news if we have it
    return window.cachedNews || [];
  }
}; 