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
    const formattedArticles = articles.map((article, index) => `
Article ${index + 1}:
Title: ${article.title}
Source: ${article.provider}
Content: ${article.content || article.description}
`).join('\n\n');

    // Updated prompt to be more direct
    const prompt = `Most plausible reason why stocks are ${marketDirection} today. In your answer, prioritize the most important and broadest reasons, such as macroeconomic factors over a single stock, unless that stock is significantly driving market sentiment. Reference specific news articles using (1), (2), etc. as footnotes. Do not make any predictions about the future.

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