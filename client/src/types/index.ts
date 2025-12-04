export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  description: string;
  icon: string;
  weathercode?: number;
}

export interface ForecastDay {
  date: string;
  avgTemp: string;
  minTemp: string;
  maxTemp: string;
  mostCommonDescription: string;
  icon: string;
  weathercode?: number;
}

export interface HistoryEntry {
  city: string;
  temperature: number;
  description: string;
  date: string;
}

export interface CityStats {
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  totalRequests: number;
  mostCommonDescription: string;
}

export interface CitySuggestion {
  name: string;
  localName: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface PopularCity {
  city: string;
  requests: number;
  country: string;
}

export interface TrendData {
  date: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
}

export type Theme = 'light' | 'dark';
export type ActiveTab = 'weather' | 'history' | 'analytics';
