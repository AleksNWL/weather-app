import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());

const typeDefs = gql`
  type Coordinates {
    lat: Float
    lon: Float
  }

  type Weather {
    city: String
    originalQuery: String
    foundCity: String
    country: String
    temperature: Float
    feels_like: Float
    temp_min: Float
    temp_max: Float
    humidity: Int
    pressure: Int
    wind_speed: Float
    wind_deg: Int
    description: String
    icon: String
    coordinates: Coordinates
  }

  type ForecastDay {
    date: String
    avgTemp: String
    minTemp: String
    maxTemp: String
    avgHumidity: Int
    mostCommonDescription: String
    icon: String
  }

  type Forecast {
    city: String
    country: String
    forecast: [ForecastDay]
  }

  type CitySearchResult {
    name: String
    localName: String
    country: String
    state: String
    lat: Float
    lon: Float
  }

  type CityStats {
    avgTemp: Float
    maxTemp: Float
    minTemp: Float
    avgHumidity: Float
    totalRequests: Int
    mostCommonDescription: String
  }

  type TrendData {
    date: String
    avgTemp: Float
    maxTemp: Float
    minTemp: Float
  }

  type PopularCity {
    city: String
    requests: Int
    country: String
  }

  type HistoryResponse {
    data: [HistoryEntry]
    pagination: Pagination
  }

  type HistoryEntry {
    city: String
    temperature: Float
    description: String
    date: String
  }

  type Pagination {
    page: Int
    limit: Int
    total: Int
    pages: Int
  }

  type Query {
    getWeather(city: String!): Weather
    getWeatherRU(city: String!): Weather
    getForecast(city: String!): Forecast
    searchCities(query: String!): [CitySearchResult]
    getCityCoordinates(city: String!): Coordinates
    getWeatherByCoords(lat: Float!, lon: Float!): Weather
    
    # Аналитика
    getCityStats(city: String!, days: Int): CityStats
    getCityTrends(city: String!, days: Int): [TrendData]
    getPopularCities(limit: Int): [PopularCity]
    getHistory(page: Int, limit: Int): HistoryResponse
  }
`;

const resolvers = {
  Query: {
    getWeather: async (_, { city }) => {
      try {
        const res = await fetch(`http://weather-service:4001/weather/${encodeURIComponent(city)}`);
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || `Weather service error: ${res.status}`);
        }
        return await res.json();
      } catch (err) {
        console.error('Weather fetch error:', err);
        throw new Error(`Не удалось получить погоду для города ${city}: ${err.message}`);
      }
    },

    getWeatherRU: async (_, { city }) => {
      try {
        const res = await fetch(`http://weather-service:4001/weather/${encodeURIComponent(city)}`);
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || `Weather service error: ${res.status}`);
        }
        const weatherData = await res.json();
        weatherData.originalQuery = city;
        return weatherData;
      } catch (err) {
        console.error('Weather RU fetch error:', err);
        throw new Error(`Не удалось получить погоду для "${city}". Попробуйте английское название.`);
      }
    },

    getForecast: async (_, { city }) => {
      try {
        const res = await fetch(`http://weather-service:4001/forecast/${encodeURIComponent(city)}`);
        if (!res.ok) throw new Error(`Forecast service error: ${res.status}`);
        return await res.json();
      } catch (err) {
        console.error(err);
        throw new Error(`Не удалось получить прогноз для города ${city}`);
      }
    },

    searchCities: async (_, { query }) => {
      try {
        const res = await fetch(`http://weather-service:4001/search/${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`Search service error: ${res.status}`);
        return await res.json();
      } catch (err) {
        console.error(err);
        throw new Error('Ошибка при поиске городов');
      }
    },

    getCityCoordinates: async (_, { city }) => {
      try {
        const res = await fetch(`http://weather-service:4001/geocode/${encodeURIComponent(city)}`);
        if (!res.ok) throw new Error(`Geocoding service error: ${res.status}`);
        const data = await res.json();
        
        if (data.length === 0) {
          throw new Error(`Город "${city}" не найден`);
        }
        
        return {
          lat: data[0].lat,
          lon: data[0].lon
        };
      } catch (err) {
        console.error(err);
        throw new Error(`Не удалось найти координаты города ${city}`);
      }
    },

    getWeatherByCoords: async (_, { lat, lon }) => {
      try {
        const res = await fetch(`http://weather-service:4001/weather/coordinates/${lat}/${lon}`);
        if (!res.ok) throw new Error(`Weather by coordinates service error: ${res.status}`);
        return await res.json();
      } catch (err) {
        console.error(err);
        throw new Error('Ошибка при получении погоды по координатам');
      }
    },

    // Аналитика
    getCityStats: async (_, { city, days = 30 }) => {
      try {
        const res = await fetch(
          `http://analytics-service:4002/stats/city/${encodeURIComponent(city)}?days=${days}`
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

    getCityTrends: async (_, { city, days = 7 }) => {
      try {
        const res = await fetch(
          `http://analytics-service:4002/trends/${encodeURIComponent(city)}?days=${days}`
        );
        if (!res.ok) throw new Error(`City trends service error: ${res.status}`);
        return await res.json();
      } catch (err) {
        console.error('City trends error:', err);
        return [];
      }
    },

    getPopularCities: async (_, { limit = 5 }) => {
      try {
        const res = await fetch(
          `http://analytics-service:4002/popular?limit=${limit}`
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

    getHistory: async (_, { page = 1, limit = 20 }) => {
      try {
        const res = await fetch(
          `http://analytics-service:4002/history?page=${page}&limit=${limit}`
        );
        if (!res.ok) throw new Error(`History service error: ${res.status}`);
        return await res.json();
      } catch (err) {
        console.error('History error:', err);
        return { data: [], pagination: {} };
      }
    },
  },
};

const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path
    };
  }
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen(4000, () => {
    console.log(`Gateway running on http://localhost:4000/graphql`);
  });
};

startServer();