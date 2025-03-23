import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;

// Debug log to check if API key is being loaded
console.log('API Key loaded:', CLAUDE_API_KEY ? 'Yes' : 'No');

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY || '', // Ensure it's not undefined
  dangerouslyAllowBrowser: true  // Temporary for development
});

export const analyzeMarketNews = async (articles, marketDirection) => {
  try {
    // Format articles for the prompt
    const formattedArticles = articles.map((article, index) => `
Article ${index + 1}:
Title: ${article.title}
Source: ${article.provider}
Content: ${article.content || article.description}
`).join('\n\n');

    // Create the analysis prompt
    const prompt = `Given the below news stories, what is the most plausible reason why stocks are ${marketDirection} for the day. Please cite specific news articles that support this conclusion.

${formattedArticles}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return response.content[0].text;

  } catch (error) {
    console.error('Error analyzing market news:', error);
    throw error;
  }
};

export const findSupportingQuotes = async (articles, analysis) => {
  try {
    // Format articles for the prompt
    const formattedArticles = articles.map((article, index) => `
Article ${index + 1}:
Title: ${article.title}
Source: ${article.provider}
Content: ${article.content || article.description}
`).join('\n\n');

    // Create the quote-finding prompt
    const prompt = `Given this market analysis:

${analysis}

And these news articles:

${formattedArticles}

Find relevant snippets from these news stories that directly support the analysis. For each supporting point, quote the specific text and cite the article number.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return response.content[0].text;

  } catch (error) {
    console.error('Error finding supporting quotes:', error);
    throw error;
  }
}; 