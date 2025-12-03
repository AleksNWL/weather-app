import mongoose from 'mongoose';

const WeatherHistorySchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  feels_like: Number,
  temp_min: Number,
  temp_max: Number,
  humidity: Number,
  pressure: Number,
  wind_speed: Number,
  wind_deg: Number,
  description: String,
  icon: String,
  country: String,
  originalQuery: String,
  queryLanguage: String,
  source: { type: String, default: 'city' },
  coordinates: {
    lat: Number,
    lon: Number
  },
  date: { type: Date, default: Date.now }
});

// Индексы для оптимизации запросов
WeatherHistorySchema.index({ city: 1, date: -1 });
WeatherHistorySchema.index({ date: -1 });
WeatherHistorySchema.index({ 'coordinates.lat': 1, 'coordinates.lon': 1 });

export const WeatherHistory = mongoose.model("WeatherHistory", WeatherHistorySchema);
