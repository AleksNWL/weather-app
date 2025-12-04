import { API_URL, POPULAR_CITIES_LIMIT, HISTORY_LIMIT, STATS_DAYS, TRENDS_DAYS } from '../constants';
import {
  WeatherData,
  ForecastDay,
  HistoryEntry,
  CityStats,
  PopularCity,
  TrendData,
} from '../types';

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

    return weatherData;
  },

  fetchForecast: async (cityName: string): Promise<ForecastDay[]> => {
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
    return result.data.getForecast?.forecast || [];
  },

  fetchStats: async (cityName: string): Promise<CityStats | null> => {
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
    return result.data.getCityStats;
  },

  fetchTrends: async (cityName: string): Promise<TrendData[]> => {
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
    return result.data.getCityTrends || [];
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
