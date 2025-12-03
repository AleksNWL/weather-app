export const API_KEY = process.env.OPENWEATHER_API_KEY;

export const OPENWEATHER_ENDPOINTS = {
  GEO_DIRECT: 'http://api.openweathermap.org/geo/1.0/direct',
  WEATHER: 'https://api.openweathermap.org/data/2.5/weather',
  FORECAST: 'https://api.openweathermap.org/data/2.5/forecast'
};

export const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:4002';
