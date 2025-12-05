import { API_URL, POPULAR_CITIES_LIMIT, HISTORY_LIMIT, STATS_DAYS, TRENDS_DAYS, CACHE_TTL } from '../constants';
import {
  WeatherData,
  ForecastDay,
  HistoryEntry,
  CityStats,
  PopularCity,
  TrendData,
} from '../types';
import { getCache, setCache } from '../utils/cache';

interface ForecastResponse {
  forecast: ForecastDay[];
}

interface HistoryResponse {
  data: HistoryEntry[];
}

interface PopularCitiesResponse {
  getPopularCities: PopularCity[];
}

interface TrendsResponse {
  getCityTrends: TrendData[];
}

interface StatsResponse {
  getCityStats: CityStats;
}

export const weatherService = {
  fetchWeather: async (cityName: string): Promise<WeatherData> => {
    // Check cache first
    const cacheKey = `weather_${cityName.toLowerCase()}`;
    const cached = getCache<WeatherData>(cacheKey);
    if (cached) {
      console.log('📦 [Cache] Using cached weather data for', cityName);
      return cached;
    }

    const query = `query { 
      getWeather(city: "${cityName}") { 
        city 
        country 
        temperature 
        feels_like
        temp_min
        temp_max
        humidity 
        pressure 
        wind_speed 
        description 
        icon 
        weathercode
      } 
    }`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await res.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    const weatherData = result.data.getWeather;
    if (!weatherData) {
      throw new Error(`Не удалось получить данные о погоде для города "${cityName}"`);
    }

    // Cache the result
    setCache(cacheKey, weatherData, CACHE_TTL);
    console.log('💾 [Cache] Cached weather data for', cityName);

    return weatherData;
  },

  fetchForecast: async (cityName: string): Promise<ForecastDay[]> => {
    // Check cache first
    const cacheKey = `forecast_${cityName.toLowerCase()}`;
    const cached = getCache<ForecastDay[]>(cacheKey);
    if (cached) {
      console.log('📦 [Cache] Using cached forecast data for', cityName);
      return cached;
    }

    const query = `
      query {
        getForecast(city: "${cityName}") {
          forecast {
            date
            avgTemp
            minTemp
            maxTemp
            mostCommonDescription
            icon
            weathercode
          }
        }
      }`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await res.json();
    const forecastData = result.data.getForecast?.forecast || [];

    // Cache the result
    setCache(cacheKey, forecastData, CACHE_TTL);
    console.log('💾 [Cache] Cached forecast data for', cityName);

    return forecastData;
  },

  fetchStats: async (cityName: string): Promise<CityStats | null> => {
    // Check cache first
    const cacheKey = `stats_${cityName.toLowerCase()}_${STATS_DAYS}`;
    const cached = getCache<CityStats | null>(cacheKey);
    if (cached !== null) {
      console.log('📦 [Cache] Using cached stats data for', cityName);
      return cached;
    }

    const query = `
      query {
        getCityStats(city: "${cityName}", days: ${STATS_DAYS}) {
          avgTemp
          maxTemp
          minTemp
          avgHumidity
          totalRequests
          mostCommonDescription
        }
      }`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await res.json();
    const statsData = result.data.getCityStats;

    // Cache the result (even if null)
    setCache(cacheKey, statsData, CACHE_TTL);
    console.log('💾 [Cache] Cached stats data for', cityName);

    return statsData;
  },

  fetchTrends: async (cityName: string): Promise<TrendData[]> => {
    // Check cache first
    const cacheKey = `trends_${cityName.toLowerCase()}_${TRENDS_DAYS}`;
    const cached = getCache<TrendData[]>(cacheKey);
    if (cached) {
      console.log('📦 [Cache] Using cached trends data for', cityName);
      return cached;
    }

    const query = `
      query {
        getCityTrends(city: "${cityName}", days: ${TRENDS_DAYS}) {
          date
          avgTemp
          maxTemp
          minTemp
        }
      }`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await res.json();
    const trendsData = result.data.getCityTrends || [];

    // Cache the result
    setCache(cacheKey, trendsData, CACHE_TTL);
    console.log('💾 [Cache] Cached trends data for', cityName);

    return trendsData;
  },

  fetchPopularCities: async (): Promise<PopularCity[]> => {
    const query = `
      query {
        getPopularCities(limit: ${POPULAR_CITIES_LIMIT}) {
          city
          requests
          country
        }
      }`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await res.json();
    console.log('Popular Cities Result:', result);
    return result.data.getPopularCities || [];
  },

  fetchHistory: async (): Promise<HistoryEntry[]> => {
    const query = `
      query {
        getHistory(limit: ${HISTORY_LIMIT}) {
          data {
            city
            temperature
            description
            date
          }
        }
      }`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await res.json();
    return result.data.getHistory?.data || [];
  },
};
