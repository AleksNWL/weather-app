const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4001;

// Open-Meteo endpoints (no API key needed)
const GEOCODE_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// Transliteration function
const transliterate = (text) => {
  const ru = 'А-а-Б-б-В-в-Г-г-Д-д-Е-е-Ё-ё-Ж-ж-З-з-И-и-Й-й-К-к-Л-л-М-м-Н-н-О-о-П-п-Р-р-С-с-Т-т-У-у-Ф-ф-Х-х-Ц-ц-Ч-ч-Ш-ш-Щ-щ-Ъ-ъ-Ы-ы-Ь-ь-Э-э-Ю-ю-Я-я'.split('-');
  const en = 'A-a-B-b-V-v-G-g-D-d-E-e-E-e-ZH-zh-Z-z-I-i-J-j-K-k-L-l-M-m-N-n-O-o-P-p-R-r-S-s-T-t-U-u-F-f-H-h-TS-ts-CH-ch-SH-sh-SCH-sch- - -Y-y- - -E-e-YU-yu-YA-ya'.split('-');
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const index = ru.indexOf(char);
    result += index !== -1 ? en[index] : char;
  }
  return result;
};

// Language detection function
const detectLanguage = (text) => {
  const cyrillicPattern = /[а-яА-ЯЁё]/;
  if (cyrillicPattern.test(text)) {
    return 'ru';
  }
  return 'en';
};

// Convert WMO weather code to description
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

// Convert WMO weather code to icon (OpenWeather compatible)
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

// Geocode endpoint
app.get('/geocode/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const language = detectLanguage(city);
    let searchCity = city;
    
    if (language === 'ru') {
      searchCity = transliterate(city);
      console.log(`📍 Geocoding: ${city} -> ${searchCity}`);
    }
    
    const response = await axios.get(
      `${GEOCODE_API}?name=${encodeURIComponent(searchCity)}&count=10&language=en`
    );
    
    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const results = response.data.results.map(loc => ({
      name: loc.name,
      country: loc.country,
      state: loc.admin1,
      lat: loc.latitude,
      lon: loc.longitude,
      timezone: loc.timezone
    }));
    
    res.json(results);
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({ error: 'Geocoding failed', details: error.message });
  }
});

// Weather endpoint
app.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const originalCity = city;
    const language = detectLanguage(city);
    let searchCity = city;
    
    if (language === 'ru') {
      searchCity = transliterate(city);
      console.log(`🌤️  Weather search: ${originalCity} -> ${searchCity}`);
    }
    
    // Geocode the city
    const geoResponse = await axios.get(
      `${GEOCODE_API}?name=${encodeURIComponent(searchCity)}&count=1&language=en`
    );
    
    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      return res.status(404).json({
        error: 'City not found',
        message: 'Try using the city name or select from suggestions',
        originalQuery: city,
        language
      });
    }
    
    const location = geoResponse.data.results[0];
    const { latitude, longitude, timezone } = location;
    
    // Get weather
    const weatherResponse = await axios.get(
      `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&daily=temperature_2m_max,temperature_2m_min&timezone=${timezone}&temperature_unit=celsius`
    );
    
    const current = weatherResponse.data.current;
    const daily = weatherResponse.data.daily;
    
    const weatherData = {
      city: location.name,
      originalQuery: originalCity,
      country: location.country,
      temperature: current.temperature_2m,
      feels_like: current.apparent_temperature,
      temp_min: daily.temperature_2m_min[0],
      temp_max: daily.temperature_2m_max[0],
      humidity: current.relative_humidity_2m,
      pressure: Math.round(current.pressure_msl),
      wind_speed: current.wind_speed_10m,
      wind_deg: current.wind_direction_10m,
      description: getWeatherDescription(current.weather_code),
      icon: getWeatherIcon(current.weather_code),
      coordinates: {
        lat: latitude,
        lon: longitude
      }
    };
    
    // Send to analytics
    try {
      console.log('📤 Sending to analytics:', {
        city: weatherData.city,
        originalQuery: weatherData.originalQuery,
        country: weatherData.country
      });
      
      await axios.post('http://analytics-service:4002/history', {
        ...weatherData,
        date: new Date(),
        queryLanguage: language
      });
    } catch (analyticsError) {
      console.error('⚠️  Analytics error:', analyticsError.message);
    }
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather', details: error.message });
  }
});

// Forecast endpoint
app.get('/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const language = detectLanguage(city);
    let searchCity = city;
    
    if (language === 'ru') {
      searchCity = transliterate(city);
    }
    
    // Geocode the city
    const geoResponse = await axios.get(
      `${GEOCODE_API}?name=${encodeURIComponent(searchCity)}&count=1&language=en`
    );
    
    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    const location = geoResponse.data.results[0];
    const { latitude, longitude, timezone } = location;
    
    // Get forecast
    const forecastResponse = await axios.get(
      `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=${timezone}&temperature_unit=celsius`
    );
    
    const daily = forecastResponse.data.daily;
    
    const aggregated = daily.time.slice(0, 5).map((date, index) => ({
      date,
      avgTemp: ((daily.temperature_2m_max[index] + daily.temperature_2m_min[index]) / 2).toFixed(1),
      minTemp: daily.temperature_2m_min[index].toFixed(1),
      maxTemp: daily.temperature_2m_max[index].toFixed(1),
      mostCommonDescription: getWeatherDescription(daily.weather_code[index]),
      icon: getWeatherIcon(daily.weather_code[index])
    }));
    
    res.json({
      city: location.name,
      country: location.country,
      forecast: aggregated
    });
  } catch (error) {
    console.error('Forecast error:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast', details: error.message });
  }
});

// Search endpoint
app.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const language = detectLanguage(query);
    let searchQuery = query;
    
    if (language === 'ru') {
      searchQuery = transliterate(query);
    }
    
    const response = await axios.get(
      `${GEOCODE_API}?name=${encodeURIComponent(searchQuery)}&count=10&language=en`
    );
    
    if (!response.data.results) {
      return res.json([]);
    }
    
    const results = response.data.results.map(city => ({
      name: city.name,
      localName: city.name,
      country: city.country,
      state: city.admin1,
      lat: city.latitude,
      lon: city.longitude
    }));
    
    res.json(results.slice(0, 5));
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Weather by coordinates endpoint
app.get('/weather/coordinates/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    // Get location name (reverse geocoding)
    const geoResponse = await axios.get(
      `${GEOCODE_API}?latitude=${latitude}&longitude=${longitude}&count=1`
    );
    
    let cityName = 'Unknown Location';
    let countryName = '';
    
    if (geoResponse.data.results && geoResponse.data.results.length > 0) {
      const location = geoResponse.data.results[0];
      cityName = location.name;
      countryName = location.country;
    }
    
    // Get weather
    const weatherResponse = await axios.get(
      `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius`
    );
    
    const current = weatherResponse.data.current;
    const daily = weatherResponse.data.daily;
    
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
      description: getWeatherDescription(current.weather_code),
      icon: getWeatherIcon(current.weather_code),
      coordinates: { lat: latitude, lon: longitude }
    };
    
    // Send to analytics
    try {
      await axios.post('http://analytics-service:4002/history', {
        ...weatherData,
        date: new Date(),
        source: 'coordinates'
      });
    } catch (analyticsError) {
      console.error('⚠️  Analytics error:', analyticsError.message);
    }
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather by coordinates error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather', details: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Weather service running on port ${PORT}`));