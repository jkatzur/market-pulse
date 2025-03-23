// Market indices symbols (Yahoo Finance symbols)
const MARKET_INDICES = {
  sp500: '^GSPC',     // No URL encoding needed
  nasdaq: '^IXIC',
  dow: '^DJI'
};

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/yahoo-finance'  // Use proxy in development
  : 'https://query1.finance.yahoo.com'; // Direct URL in production

export const getMarketData = async () => {
  try {
    const quotes = await Promise.all(
      Object.entries(MARKET_INDICES).map(async ([key, symbol]) => {
        console.log(`Fetching data for ${symbol}...`);
        try {
          // Add headers to avoid CORS issues
          const response = await fetch(`${BASE_URL}/v8/finance/chart/${encodeURIComponent(symbol)}`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            console.error(`HTTP error for ${symbol}:`, response.status);
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log(`Raw data for ${symbol}:`, data);

          if (!data?.chart?.result?.[0]?.meta) {
            console.error(`Invalid data structure for ${symbol}:`, data);
            throw new Error(`Invalid data structure for ${symbol}`);
          }

          const quote = data.chart.result[0].meta;
          console.log(`Processed quote for ${symbol}:`, quote);

          // Calculate percentage change using Number to ensure we have numbers
          const currentPrice = Number(quote.regularMarketPrice);
          const previousClose = Number(quote.previousClose);
          const change = currentPrice - previousClose;
          const percentChange = (change / previousClose) * 100;

          const result = {
            key,
            currentPrice: currentPrice,
            change: Number(change.toFixed(2)),
            percentChange: Number(percentChange.toFixed(2)),
            high: Number(quote.regularMarketDayHigh),
            low: Number(quote.regularMarketDayLow),
            previousClose: previousClose,
            timestamp: new Date(quote.regularMarketTime * 1000).toLocaleString()
          };

          console.log(`Final processed data for ${symbol}:`, result);
          return result;

        } catch (symbolError) {
          console.error(`Error processing ${symbol}:`, symbolError);
          throw symbolError;
        }
      })
    );

    const result = quotes.reduce((acc, quote) => {
      acc[quote.key] = quote;
      return acc;
    }, {});

    console.log('Final market data:', result);
    return result;

  } catch (error) {
    console.error('Error in getMarketData:', error);
    throw error;
  }
};

export const getIntradayData = async (symbol, resolution = '1') => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const startOfDay = Math.floor(new Date().setHours(9, 30, 0, 0) / 1000); // 9:30 AM EST

    const response = await fetch(
      `${BASE_URL}/v8/finance/chart/${MARKET_INDICES[symbol]}?interval=1m&period1=${startOfDay}&period2=${now}`
    );
    const data = await response.json();

    return data.chart.result[0];
  } catch (error) {
    console.error(`Error fetching intraday data for ${symbol}:`, error);
    throw error;
  }
}; 