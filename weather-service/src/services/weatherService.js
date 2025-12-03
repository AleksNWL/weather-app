import axios from 'axios';
import { OPENWEATHER_ENDPOINTS, API_KEY, ANALYTICS_SERVICE_URL } from '../config/constants.js';
import { transliterate, detectLanguage, getMostCommon } from '../utils/language.js';

/**
 * Geocode city name to coordinates
 */
export const geocodeCity = async (city) => {
  try {
    // Try direct search first
    const directResponse = await axios.get(
      `${OPENWEATHER_ENDPOINTS.GEO_DIRECT}?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`
    );
    
    if (directResponse.data.length > 0) {
      return directResponse.data;
    }
    
    // If not found and it's Russian text, try transliteration
    if (detectLanguage(city) === 'ru') {
      const transliterated = transliterate(city);
      console.log(`📍 Trying transliteration: ${city} -> ${transliterated}`);
      
      const translitResponse = await axios.get(
        `${OPENWEATHER_ENDPOINTS.GEO_DIRECT}?q=${encodeURIComponent(transliterated)}&limit=5&appid=${API_KEY}`
      );
      
      if (translitResponse.data.length > 0) {
        return translitResponse.data;
      }
    }
    
    // More general search
    const searchResponse = await axios.get(
      `${OPENWEATHER_ENDPOINTS.GEO_DIRECT}?q=${encodeURIComponent(city)}&limit=10&appid=${API_KEY}`
    );
    
    return searchResponse.data;
    
  } catch (error) {
    console.error('❌ Geocoding error:', error.message);
    throw new Error(`Geocoding failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get current weather for a city
 */
export const getWeatherByCity = async (city) => {
  try {
    const originalCity = city;
    const language = detectLanguage(city);
    
    let searchCity = city;
    
    // Transliterate if Russian
    if (language === 'ru') {
      searchCity = transliterate(city);
      console.log(`🌤️  Searching weather for: ${originalCity} (transliterated to: ${searchCity})`);
    }
    
    const response = await axios.get(
      `${OPENWEATHER_ENDPOINTS.WEATHER}?q=${encodeURIComponent(searchCity)}&appid=${API_KEY}&units=metric&lang=${language === 'ru' ? 'ru' : 'en'}`
    );

    const weatherData = {
      city: response.data.name,
      originalQuery: originalCity,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      temp_min: response.data.main.temp_min,
      temp_max: response.data.main.temp_max,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      wind_speed: response.data.wind.speed,
      wind_deg: response.data.wind.deg,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      coordinates: {
        lat: response.data.coord.lat,
        lon: response.data.coord.lon
      }
    };

    // Send to analytics
    await sendToAnalytics({
      ...weatherData,
      date: new Date(),
      queryLanguage: language
    });

    return weatherData;
    
  } catch (error) {
    console.error('❌ Weather fetch error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw {
        status: 404,
        message: 'Город не найден',
        hint: 'Попробуйте использовать английское название города',
        originalQuery: city,
        language: detectLanguage(city)
      };
    }
    
    throw new Error(`Weather fetch failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get 5-day forecast for a city
 */
export const getForecast = async (city) => {
  try {
    let searchCity = city;
    const language = detectLanguage(city);
    
    // Transliterate if Russian
    if (language === 'ru') {
      searchCity = transliterate(city);
    }
    
    const response = await axios.get(
      `${OPENWEATHER_ENDPOINTS.FORECAST}?q=${encodeURIComponent(searchCity)}&appid=${API_KEY}&units=metric&lang=${language === 'ru' ? 'ru' : 'en'}`
    );

    // Group by days
    const dailyForecasts = {};
    response.data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          temps: [],
          descriptions: [],
          humidity: [],
          icons: []
        };
      }
      dailyForecasts[date].temps.push(item.main.temp);
      dailyForecasts[date].descriptions.push(item.weather[0].description);
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].icons.push(item.weather[0].icon);
    });

    // Aggregate data by days
    const aggregated = Object.values(dailyForecasts).map(day => ({
      date: day.date,
      avgTemp: (day.temps.reduce((a, b) => a + b, 0) / day.temps.length).toFixed(1),
      minTemp: Math.min(...day.temps).toFixed(1),
      maxTemp: Math.max(...day.temps).toFixed(1),
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      mostCommonDescription: getMostCommon(day.descriptions),
      icon: getMostCommon(day.icons)
    }));

    return {
      city: response.data.city.name,
      country: response.data.city.country,
      forecast: aggregated.slice(0, 5)
    };
    
  } catch (error) {
    console.error('❌ Forecast fetch error:', error.message);
    throw new Error(`Forecast fetch failed: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Search cities with improved Russian language handling
 */
export const searchCities = async (query) => {
  try {
    const language = detectLanguage(query);
    
    let searchQuery = query;
    
    // Add transliterated variant for Russian text
    if (language === 'ru') {
      const transliterated = transliterate(query);
      searchQuery = `${query}|${transliterated}`;
    }
    
    const response = await axios.get(
      `${OPENWEATHER_ENDPOINTS.GEO_DIRECT}?q=${encodeURIComponent(searchQuery)}&limit=10&appid=${API_KEY}`
    );
    
    const results = response.data.map(city => ({
      name: city.name,
      localName: city.local_names?.ru || city.name,
      country: city.country,
      state: city.state,
      lat: city.lat,
      lon: city.lon,
      relevance: city.relevance || 0
    }));
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results.slice(0, 5);
    
  } catch (error) {
    console.error('❌ Search error:', error.message);
    throw new Error(`Search failed: ${error.message}`);
  }
};

/**
 * Get weather by coordinates
 */
export const getWeatherByCoordinates = async (lat, lon) => {
  try {
    const response = await axios.get(
      `${OPENWEATHER_ENDPOINTS.WEATHER}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`
    );

    const weatherData = {
      city: response.data.name,
      country: response.data.sys.country,
      temperature: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      temp_min: response.data.main.temp_min,
      temp_max: response.data.main.temp_max,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      wind_speed: response.data.wind.speed,
      wind_deg: response.data.wind.deg,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      coordinates: {
        lat: response.data.coord.lat,
        lon: response.data.coord.lon
      }
    };

    // Send to analytics
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
    // Don't throw - analytics failure shouldn't break the weather service
  }
};
