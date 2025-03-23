const GNEWS_ENDPOINT = 'https://gnews.io/api/v4/search';
const GNEWS_API_KEY = process.env.REACT_APP_GNEWS_API_KEY;

export const getMarketNews = async () => {
  try {
    const response = await fetch(
      `${GNEWS_ENDPOINT}?q=stock market OR wall street&lang=en&country=us&max=10&sortby=publishedAt&apikey=${GNEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('News data:', data);

    return data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      provider: article.source.name,
      datePublished: article.publishedAt,
      content: article.content
    }));

  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}; 