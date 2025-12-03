// Open-Meteo API doesn't require an API key
export const OPEN_METEO_ENDPOINTS = {
  GEOCODE: 'https://geocoding-api.open-meteo.com/v1/search',
  WEATHER: 'https://api.open-meteo.com/v1/forecast'
};

export const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:4002';
