import fetch from 'node-fetch';
import { WEATHER_SERVICE_URL, ANALYTICS_SERVICE_URL } from '../config/constants.js';

/**
 * Weather service client
 */
export const weatherServiceClient = {
  async getWeather(city) {
    const res = await fetch(`${WEATHER_SERVICE_URL}/weather/${encodeURIComponent(city)}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Weather service error: ${res.status}`);
    }
    return await res.json();
  },

  async getForecast(city) {
    const res = await fetch(`${WEATHER_SERVICE_URL}/forecast/${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`Forecast service error: ${res.status}`);
    return await res.json();
  },

  async searchCities(query) {
    const res = await fetch(`${WEATHER_SERVICE_URL}/search/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Search service error: ${res.status}`);
    return await res.json();
  },

  async geocodeCity(city) {
    const res = await fetch(`${WEATHER_SERVICE_URL}/geocode/${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`Geocoding service error: ${res.status}`);
    const data = await res.json();
    
    if (data.length === 0) {
      throw new Error(`Город "${city}" не найден`);
    }
    
    return {
      lat: data[0].lat,
      lon: data[0].lon
    };
  },

  async getWeatherByCoords(lat, lon) {
    const res = await fetch(`${WEATHER_SERVICE_URL}/weather/coordinates/${lat}/${lon}`);
    if (!res.ok) throw new Error(`Weather by coordinates service error: ${res.status}`);
    return await res.json();
  }
};

/**
 * Analytics service client
 */
export const analyticsServiceClient = {
  async getCityStats(city, days = 30) {
    try {
      const res = await fetch(
        `${ANALYTICS_SERVICE_URL}/stats/city/${encodeURIComponent(city)}?days=${days}`
      );
      if (!res.ok) throw new Error(`City stats service error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('City stats error:', err);
      return {
        avgTemp: null,
        maxTemp: null,
        minTemp: null,
        avgHumidity: null,
        totalRequests: 0,
        mostCommonDescription: ''
      };
    }
  },

  async getCityTrends(city, days = 7) {
    try {
      const res = await fetch(
        `${ANALYTICS_SERVICE_URL}/trends/${encodeURIComponent(city)}?days=${days}`
      );
      if (!res.ok) throw new Error(`City trends service error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('City trends error:', err);
      return [];
    }
  },

  async getPopularCities(limit = 5) {
    try {
      const res = await fetch(
        `${ANALYTICS_SERVICE_URL}/popular?limit=${limit}`
      );
      if (!res.ok) throw new Error(`Popular cities service error: ${res.status}`);
      const data = await res.json();
      
      console.log('Raw data from analytics:', data);
      return data;
      
    } catch (err) {
      console.error('Popular cities error:', err);
      return [];
    }
  },

  async getHistory(page = 1, limit = 20) {
    try {
      const res = await fetch(
        `${ANALYTICS_SERVICE_URL}/history?page=${page}&limit=${limit}`
      );
      if (!res.ok) throw new Error(`History service error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('History error:', err);
      return { data: [], pagination: {} };
    }
  }
};
