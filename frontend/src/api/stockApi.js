import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://stock-analytics-dashboard-production.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const fetchStockData = async (ticker, period = '3mo') => {
  const response = await api.get(`/api/stock/${ticker}`, {
    params: { period },
  });
  return response.data;
};

export const fetchPopularStocks = async () => {
  const response = await api.get('/api/search');
  return response.data;
};

export const fetchHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};
