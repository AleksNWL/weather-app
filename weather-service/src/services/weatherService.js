import axios from 'axios';
import { OPEN_METEO_ENDPOINTS, ANALYTICS_SERVICE_URL } from '../config/constants.js';
import { getMostCommon } from '../utils/language.js';

/**
 * Convert WMO weather code to description
 */
const getWeatherDescription = (weatherCode) => {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with hail'
  };
  return descriptions[weatherCode] || 'Unknown';
};

/**
 * Convert WMO weather code to icon
 */
const getWeatherIcon = (weatherCode) => {
  if (weatherCode === 0) return '01d';
  if (weatherCode === 1 || weatherCode === 2) return '02d';
  if (weatherCode === 3) return '04d';
  if (weatherCode === 45 || weatherCode === 48) return '50d';
  if (weatherCode >= 51 && weatherCode <= 67) return '10d';
  if (weatherCode >= 71 && weatherCode <= 86) return '13d';
  if (weatherCode >= 95 && weatherCode <= 99) return '11d';
  return '01d';
};

/**
 * Geocode city name to coordinates using Open-Meteo
 */
export const geocodeCity = async (city) => {
  try {
    const response = await axios.get(
      `${OPEN_METEO_ENDPOINTS.GEOCODE}?name=${encodeURIComponent(city)}&count=10&language=en`
    );
    
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('City not found');
    }
    
    return response.data.results.map(location => ({
      name: location.name,
      country: location.country,
      state: location.admin1,
      lat: location.latitude,
      lon: location.longitude,
      timezone: location.timezone
    }));
    
  } catch (error) {
    console.error('❌ Geocoding error:', error.message);
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

/**
 * Get current weather for a city using Open-Meteo
 */
export const getWeatherByCity = async (city) => {
  try {
    const geocodingResponse = await axios.get(
      `${OPEN_METEO_ENDPOINTS.GEOCODE}?name=${encodeURIComponent(city)}&count=1&language=en`
    );
    
    if (!geocodingResponse.data.results || geocodingResponse.data.results.length === 0) {
      throw new Error('City not found');
    }
    
    const location = geocodingResponse.data.results[0];
    const { latitude, longitude, timezone } = location;
    
    const weatherResponse = await axios.get(
      `${OPEN_METEO_ENDPOINTS.WEATHER}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&daily=temperature_2m_max,temperature_2m_min&timezone=${timezone}&temperature_unit=celsius`
    );
    
    const current = weatherResponse.data.current;
    const daily = weatherResponse.data.daily;
    const weatherDescription = getWeatherDescription(current.weather_code);
    const weatherIcon = getWeatherIcon(current.weather_code);
    
    console.log('🌦️ [Weather Service] weather_code от API:', current.weather_code);
    console.log('📝 [Weather Service] weatherDescription:', weatherDescription);
    console.log('🎨 [Weather Service] weatherIcon:', weatherIcon);
    
    const weatherData = {
      city: location.name,
      country: location.country,
      temperature: current.temperature_2m,
      feels_like: current.apparent_temperature,
      temp_min: daily.temperature_2m_min[0],
      temp_max: daily.temperature_2m_max[0],
      humidity: current.relative_humidity_2m,
      pressure: Math.round(current.pressure_msl),
      wind_speed: current.wind_speed_10m,
      wind_deg: current.wind_direction_10m,
      description: weatherDescription,
      icon: weatherIcon,
      weathercode: current.weather_code,
      coordinates: {
        lat: latitude,
        lon: longitude
      }
    };
    
    console.log('✅ [Weather Service] Отправляемые данные о погоде:', JSON.stringify(weatherData, null, 2));

    await sendToAnalytics({
      ...weatherData,
      date: new Date()
    });

    return weatherData;
    
  } catch (error) {
    console.error('❌ Weather fetch error:', error.message);
    
    if (error.message.includes('not found') || error.message.includes('City not found')) {
      throw {
        status: 404,
        message: 'City not found',
        hint: 'Try using the city name or selecting from suggestions',
        originalQuery: city
      };
    }
    
    throw new Error(`Weather fetch failed: ${error.message}`);
  }
};

/**
 * Get 5-day forecast for a city using Open-Meteo
 */
export const getForecast = async (city) => {
  try {
    const geocodingResponse = await axios.get(
      `${OPEN_METEO_ENDPOINTS.GEOCODE}?name=${encodeURIComponent(city)}&count=1&language=en`
    );
    
    if (!geocodingResponse.data.results || geocodingResponse.data.results.length === 0) {
      throw new Error('City not found');
    }
    
    const location = geocodingResponse.data.results[0];
    const { latitude, longitude, timezone } = location;
    
    const forecastResponse = await axios.get(
      `${OPEN_METEO_ENDPOINTS.WEATHER}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=${timezone}&temperature_unit=celsius`
    );
    
    const daily = forecastResponse.data.daily;
    
    console.log('📋 [Weather Service] daily.weather_code массив:', daily.weather_code);
    
    const aggregated = daily.time.slice(0, 5).map((date, index) => ({
      date,
      avgTemp: ((daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2).toFixed(1),
      minTemp: daily.temperature_2m_min[index].toFixed(1),
      maxTemp: daily.temperature_2m_max[index].toFixed(1),
      mostCommonDescription: getWeatherDescription(daily.weather_code[index]),
      icon: getWeatherIcon(daily.weather_code[index]),
      weathercode: daily.weather_code[index]
    }));

    console.log('📋 [Weather Service] Агрегированный прогноз:', JSON.stringify(aggregated, null, 2));

    return {
      city: location.name,
      country: location.country,
      forecast: aggregated
    };
    
  } catch (error) {
    console.error('❌ Forecast fetch error:', error.message);
    throw new Error(`Forecast fetch failed: ${error.message}`);
  }
};

/**
 * Search cities with improved Russian language handling
 */
export const searchCities = async (query) => {
  try {
    const language = detectLanguage(query);
    
    let searchQuery = query;
    
    if (language === 'ru') {
      searchQuery = transliterate(query);
    }
    
    const response = await axios.get(
      `${OPEN_METEO_ENDPOINTS.GEOCODE}?name=${encodeURIComponent(searchQuery)}&count=10&language=en`
    );
    
    if (!response.data.results) {
      return [];
    }
    
    const results = response.data.results.map(city => ({
      name: city.name,
      localName: city.name,
      country: city.country,
      state: city.admin1,
      lat: city.latitude,
      lon: city.longitude
    }));
    
    return results.slice(0, 5);
    
  } catch (error) {
    console.error('❌ Search error:', error.message);
    throw new Error(`Search failed: ${error.message}`);
  }
};

/**
 * Get weather by coordinates using Open-Meteo
 */
export const getWeatherByCoordinates = async (lat, lon) => {
  try {
    const geoResponse = await axios.get(
      `${OPEN_METEO_ENDPOINTS.GEOCODE}?latitude=${lat}&longitude=${lon}&count=1`
    );
    
    let cityName = 'Unknown Location';
    let countryName = '';
    
    if (geoResponse.data.results && geoResponse.data.results.length > 0) {
      const location = geoResponse.data.results[0];
      cityName = location.name;
      countryName = location.country;
    }
    
    const weatherResponse = await axios.get(
      `${OPEN_METEO_ENDPOINTS.WEATHER}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius`
    );
    
    const current = weatherResponse.data.current;
    const daily = weatherResponse.data.daily;
    const weatherDescription = getWeatherDescription(current.weather_code);
    const weatherIcon = getWeatherIcon(current.weather_code);
    
    const weatherData = {
      city: cityName,
      country: countryName,
      temperature: current.temperature_2m,
      feels_like: current.apparent_temperature,
      temp_min: daily.temperature_2m_min[0],
      temp_max: daily.temperature_2m_max[0],
      humidity: current.relative_humidity_2m,
      pressure: Math.round(current.pressure_msl),
      wind_speed: current.wind_speed_10m,
      wind_deg: current.wind_direction_10m,
      description: weatherDescription,
      icon: weatherIcon,
      coordinates: {
        lat,
        lon
      }
    };

    await sendToAnalytics({
      ...weatherData,
      date: new Date(),
      source: 'coordinates'
    });

    return weatherData;
    
  } catch (error) {
    console.error('❌ Weather by coordinates error:', error.message);
    throw new Error(`Failed to get weather by coordinates: ${error.message}`);
  }
};

/**
 * Send weather data to analytics service
 */
const sendToAnalytics = async (data) => {
  try {
    console.log('📤 Sending to analytics:', {
      city: data.city,
      originalQuery: data.originalQuery,
      country: data.country
    });
    
    await axios.post(`${ANALYTICS_SERVICE_URL}/history`, data);
  } catch (analyticsError) {
    console.error('⚠️  Failed to send to analytics:', analyticsError.message);
  }
};
