const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4001;
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Улучшенная функция транслитерации
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

// Улучшенная функция для определения языка
const detectLanguage = (text) => {
  const cyrillicPattern = /[а-яА-ЯЁё]/;
  const latinPattern = /[a-zA-Z]/;
  
  if (cyrillicPattern.test(text)) {
    return 'ru';
  } else if (latinPattern.test(text)) {
    return 'en';
  }
  return 'unknown';
};

app.get('/geocode/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    // 1. Сначала пробуем найти напрямую
    const directResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`
    );
    
    if (directResponse.data.length > 0) {
      return res.json(directResponse.data);
    }
    
    // 2. Если не нашли, и это русский текст - пробуем транслитерацию
    if (detectLanguage(city) === 'ru') {
      const transliterated = transliterate(city);
      console.log(`Trying transliteration: ${city} -> ${transliterated}`);
      
      const translitResponse = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(transliterated)}&limit=5&appid=${API_KEY}`
      );
      
      if (translitResponse.data.length > 0) {
        return res.json(translitResponse.data);
      }
    }
    
    // 3. Пробуем более общий поиск
    const searchResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=10&appid=${API_KEY}`
    );
    
    res.json(searchResponse.data);
    
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({ 
      error: 'Geocoding failed',
      details: error.response?.data?.message || error.message 
    });
  }
});

// Получаем расширенные данные о погоде
app.get('/weather/:city', async (req, res) => {
  try {
    let { city } = req.params;
    const originalCity = city;
    const language = detectLanguage(city);
    
    let searchCity = city;
    
    // Если русский текст - пробуем транслитерацию
    if (language === 'ru') {
      searchCity = transliterate(city);
      console.log(`Searching weather for: ${originalCity} (transliterated to: ${searchCity})`);
    }
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchCity)}&appid=${API_KEY}&units=metric&lang=${language === 'ru' ? 'ru' : 'en'}`
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

    // Отправляем в аналитику
    try {
      const analyticsData = {
        ...weatherData,
        date: new Date(),
        queryLanguage: language
      };
      
      console.log('📤 Sending to analytics:', {
        city: analyticsData.city,
        originalQuery: analyticsData.originalQuery,
        country: analyticsData.country
      });
      
      await axios.post('http://analytics-service:4002/history', analyticsData);
    } catch (analyticsError) {
      console.error('Failed to send to analytics:', analyticsError.message);
    }

    res.json(weatherData);
  } catch (error) {
    console.error('Weather fetch error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Город не найден',
        message: 'Попробуйте использовать английское название города',
        originalQuery: req.params.city,
        language: detectLanguage(req.params.city)
      });
    }
    
    res.status(500).json({ 
      error: 'Ошибка при получении данных о погоде',
      details: error.response?.data?.message || error.message
    });
  }
});

// Прогноз на 5 дней
app.get('/forecast/:city', async (req, res) => {
  try {
    let { city } = req.params;
    const language = detectLanguage(city);
    
    // Если русский текст - пробуем транслитерацию
    if (language === 'ru') {
      city = transliterate(city);
    }
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${language === 'ru' ? 'ru' : 'en'}`
    );

    // Группируем по дням
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

    // Агрегируем данные по дням
    const aggregated = Object.values(dailyForecasts).map(day => ({
      date: day.date,
      avgTemp: (day.temps.reduce((a, b) => a + b, 0) / day.temps.length).toFixed(1),
      minTemp: Math.min(...day.temps).toFixed(1),
      maxTemp: Math.max(...day.temps).toFixed(1),
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      mostCommonDescription: getMostCommon(day.descriptions),
      icon: getMostCommon(day.icons)
    }));

    res.json({
      city: response.data.city.name,
      country: response.data.city.country,
      forecast: aggregated.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при получении прогноза',
      details: error.response?.data?.message || error.message
    });
  }
});

function getMostCommon(arr) {
  if (!arr || arr.length === 0) return '';
  return arr.sort((a,b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

// Поиск городов с улучшенной обработкой русского языка
app.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const language = detectLanguage(query);
    
    let searchQuery = query;
    
    // Если русский текст - добавляем транслитерированный вариант
    if (language === 'ru') {
      const transliterated = transliterate(query);
      searchQuery = `${query}|${transliterated}`;
    }
    
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=10&appid=${API_KEY}`
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
    
    // Сортируем по релевантности
    results.sort((a, b) => b.relevance - a.relevance);
    
    res.json(results.slice(0, 5));
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ 
      error: 'Ошибка при поиске городов',
      details: error.message
    });
  }
});

// Погода по координатам (резервный вариант)
app.get('/weather/coordinates/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`
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

    // Сохраняем в аналитику
    try {
      await axios.post('http://analytics-service:4002/history', {
        ...weatherData,
        date: new Date(),
        source: 'coordinates'
      });
    } catch (analyticsError) {
      console.error('Failed to send to analytics:', analyticsError.message);
    }

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при получении погоды по координатам',
      details: error.message
    });
  }
});

app.listen(PORT, () => console.log(`Weather service running on port ${PORT}`));