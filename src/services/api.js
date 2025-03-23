const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const getMarketData = async () => {
  const response = await fetch(`${API_BASE_URL}/market/data`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const getIntradayData = async (index) => {
  const response = await fetch(`${API_BASE_URL}/market/intraday/${index}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const getMarketNews = async () => {
  const response = await fetch(`${API_BASE_URL}/news`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const analyzeMarketNews = async (articles, marketDirection) => {
  const response = await fetch(`${API_BASE_URL}/analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ articles, marketDirection }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  return data.analysis;
}; 