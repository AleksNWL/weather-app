import { weatherServiceClient, analyticsServiceClient } from '../services/serviceClients.js';

export const resolvers = {
  Query: {
    // ========== Weather Queries ==========
    getWeather: async (_, { city }) => {
      try {
        return await weatherServiceClient.getWeather(city);
      } catch (err) {
        console.error('Weather fetch error:', err);
        throw new Error(`Не удалось получить погоду для города ${city}: ${err.message}`);
      }
    },

    getWeatherRU: async (_, { city }) => {
      try {
        const weatherData = await weatherServiceClient.getWeather(city);
        weatherData.originalQuery = city;
        return weatherData;
      } catch (err) {
        console.error('Weather RU fetch error:', err);
        throw new Error(`Не удалось получить погоду для "${city}". Попробуйте английское название.`);
      }
    },

    getForecast: async (_, { city }) => {
      try {
        return await weatherServiceClient.getForecast(city);
      } catch (err) {
        console.error(err);
        throw new Error(`Не удалось получить прогноз для города ${city}`);
      }
    },

    searchCities: async (_, { query }) => {
      try {
        return await weatherServiceClient.searchCities(query);
      } catch (err) {
        console.error(err);
        throw new Error('Ошибка при поиске городов');
      }
    },

    getCityCoordinates: async (_, { city }) => {
      try {
        return await weatherServiceClient.geocodeCity(city);
      } catch (err) {
        console.error(err);
        throw new Error(`Не удалось найти координаты города ${city}`);
      }
    },

    getWeatherByCoords: async (_, { lat, lon }) => {
      try {
        return await weatherServiceClient.getWeatherByCoords(lat, lon);
      } catch (err) {
        console.error(err);
        throw new Error('Ошибка при получении погоды по координатам');
      }
    },

    // ========== Analytics Queries ==========
    getCityStats: async (_, { city, days = 30 }) => {
      return await analyticsServiceClient.getCityStats(city, days);
    },

    getCityTrends: async (_, { city, days = 7 }) => {
      return await analyticsServiceClient.getCityTrends(city, days);
    },

    getPopularCities: async (_, { limit = 5 }) => {
      return await analyticsServiceClient.getPopularCities(limit);
    },

    getHistory: async (_, { page = 1, limit = 20 }) => {
      return await analyticsServiceClient.getHistory(page, limit);
    },
  },
};
