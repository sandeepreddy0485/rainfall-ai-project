import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://rainfall-ai-project.onrender.com'
  : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Location Services
export const locationAPI = {
  search: (query) => api.get('/location', { params: { query } }),
  reverse: (lat, lon) => api.get('/location/reverse', { params: { lat, lon } }),
};

// Weather Services
export const weatherAPI = {
  axios: api,
  getCurrentWeather: (lat, lon) =>
    api.get('/weather/current', { params: { lat, lon } }),
  
  getHistoricalWeather: (lat, lon) =>
    api.get('/weather/historical', { params: { lat, lon } }),
  
  getPredictions: (lat, lon, days = 7) =>
    api.get('/predict', { params: { lat, lon, days } }),
  
  getDroughtAnalysis: (lat, lon, days = 7) =>
    api.get('/drought', { params: { lat, lon, days } }),
};

// Trend Analysis
export const trendAPI = {
  analyze: (lat, lon) =>
    api.get('/trends/analysis', { params: { lat, lon } }),
};

export default api;
