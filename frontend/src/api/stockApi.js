const API_URL = import.meta.env.VITE_API_URL || 'https://stock-analytics-dashboard-production.up.railway.app';

export const getStockData = async (ticker) => {
  const response = await fetch(`${API_URL}/api/stock/${ticker}`);
  if (!response.ok) throw new Error('Failed to fetch stock data');
  return response.json();
};

export const getComparison = async (tickers) => {
  const response = await fetch(`${API_URL}/api/compare?tickers=${tickers}`);
  if (!response.ok) throw new Error('Failed to fetch comparison');
  return response.json();
};

export const getScreener = async (filter) => {
  const response = await fetch(`${API_URL}/api/screener?filter=${filter}`);
  if (!response.ok) throw new Error('Failed to fetch screener');
  return response.json();
};

export const getNews = async (ticker) => {
  const response = await fetch(`${API_URL}/api/news/${ticker}`);
  if (!response.ok) return [];
  return response.json();
};
