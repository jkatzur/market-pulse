import fetch from 'node-fetch';

// Market indices symbols (Yahoo Finance symbols)
const MARKET_INDICES = {
  sp500: '^GSPC',     // No URL encoding needed
  nasdaq: '^IXIC',
  dow: '^DJI'
};

const BASE_URL = 'https://query1.finance.yahoo.com'; // Always use direct URL on backend

export const getMarketData = async () => {
  try {
    const quotes = await Promise.all(
      Object.entries(MARKET_INDICES).map(async ([key, symbol]) => {
        try {
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

          if (!data?.chart?.result?.[0]?.meta) {
            console.error(`Invalid data structure for ${symbol}:`, data);
            throw new Error(`Invalid data structure for ${symbol}`);
          }

          const quote = data.chart.result[0].meta;

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

    return result;

  } catch (error) {
    console.error('Error in getMarketData:', error);
    throw error;
  }
};

export const getIntradayData = async (symbol, resolution = '1d') => {
  try {
    // Get data for the last 5 trading days
    const now = Math.floor(Date.now() / 1000);
    const fiveDaysAgo = now - (5 * 24 * 60 * 60);

    const response = await fetch(
      `${BASE_URL}/v8/finance/chart/${encodeURIComponent(MARKET_INDICES[symbol])}?interval=1d&period1=${fiveDaysAgo}&period2=${now}&range=5d`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.chart?.result?.[0]) {
      console.error(`No data available for ${symbol}`);
      return [];
    }

    const result = data.chart.result[0];
    
    // Check if we have both timestamps and prices
    if (!result.timestamp || !result.indicators?.quote?.[0]?.close) {
      console.error(`Incomplete data for ${symbol}`, result);
      return [];
    }

    const timestamps = result.timestamp;
    const prices = result.indicators.quote[0].close;

    // Format data for Chart.js
    const chartData = timestamps
      .map((timestamp, index) => {
        const price = prices[index];
        if (price === null || price === undefined) return null;
        
        return {
          x: new Date(timestamp * 1000),
          y: price
        };
      })
      .filter(point => point !== null);

    
    if (chartData.length === 0) {
      console.warn(`No valid data points for ${symbol}`);
      return [];
    }

    return chartData;

  } catch (error) {
    console.error(`Error fetching daily data for ${symbol}:`, error);
    return [];
  }
}; 