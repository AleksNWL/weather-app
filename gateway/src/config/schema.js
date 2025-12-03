import { gql } from 'apollo-server-express';

export const typeDefs = gql`
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
    # Weather queries
    getWeather(city: String!): Weather
    getWeatherRU(city: String!): Weather
    getForecast(city: String!): Forecast
    searchCities(query: String!): [CitySearchResult]
    getCityCoordinates(city: String!): Coordinates
    getWeatherByCoords(lat: Float!, lon: Float!): Weather
    
    # Analytics queries
    getCityStats(city: String!, days: Int): CityStats
    getCityTrends(city: String!, days: Int): [TrendData]
    getPopularCities(limit: Int): [PopularCity]
    getHistory(page: Int, limit: Int): HistoryResponse
  }
`;
