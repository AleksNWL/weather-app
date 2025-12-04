import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';
import getIconWeather from './utils/getIconWeather';

const API_URL = "http://localhost:4000/graphql";

interface WeatherData {
  city: string;
  originalQuery?: string;
  foundCity?: string;
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

interface ForecastDay {
  date: string;
  avgTemp: string;
  minTemp: string;
  maxTemp: string;
  mostCommonDescription: string;
  icon: string;
  weathercode?: number;
}

interface HistoryEntry {
  city: string;
  temperature: number;
  description: string;
  date: string;
}

interface CityStats {
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  totalRequests: number;
  mostCommonDescription: string;
}

interface CitySuggestion {
  name: string;
  localName: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

function App() {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<CityStats | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [popularCities, setPopularCities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'weather' | 'history' | 'analytics'>('weather');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Инициализация темы при загрузке
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Загрузка популярных городов при загрузке
  useEffect(() => {
    fetchPopularCities();
    fetchRecentHistory();
  }, []);

  const fetchPopularCities = async () => {
    const query = `
      query {
        getPopularCities(limit: 5) {
          city
          requests
          country
        }
      }`;
    
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const result = await res.json();
      console.log('Popular Cities Result:', result);
      setPopularCities(result.data.getPopularCities || []);
    } catch (error) {
      console.error('Error fetching popular cities:', error);
    }
  };

  const fetchRecentHistory = async () => {
    const query = `
      query {
        getHistory(limit: 10) {
          data {
            city
            temperature
            description
            date
          }
        }
      }`;
    
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const result = await res.json();
      setHistory(result.data.getHistory?.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const searchQuery = `
      query {
        searchCities(query: "${query}") {
          name
          localName
          country
          state
          lat
          lon
        }
      }`;
    
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const result = await res.json();
      setSuggestions(result.data.searchCities || []);
    } catch (error) {
      console.error('Error searching cities:', error);
    }
  };

  const detectLanguage = (text: string): 'ru' | 'en' => {
    const cyrillicPattern = /[а-яА-ЯЁё]/;
    return cyrillicPattern.test(text) ? 'ru' : 'en';
  };

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    setWeather(null);
    setForecast([]);
    setStats(null);
    setTrends([]);
    
    const language = detectLanguage(cityName);
    
    // Определяем какой запрос использовать
    const weatherQuery = language === 'ru' ? 
      `query { 
        getWeatherRU(city: "${cityName}") { 
          city 
          originalQuery
          foundCity
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
      }` :
      `query { 
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
    
    const forecastQuery = `
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

    const statsQuery = `
      query {
        getCityStats(city: "${cityName}", days: 30) {
          avgTemp
          maxTemp
          minTemp
          avgHumidity
          totalRequests
          mostCommonDescription
        }
      }`;

    const trendsQuery = `
      query {
        getCityTrends(city: "${cityName}", days: 7) {
          date
          avgTemp
          maxTemp
          minTemp
        }
      }`;

    try {
      // Параллельные запросы
      const [weatherRes, forecastRes, statsRes, trendsRes] = await Promise.all([
        fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: weatherQuery }),
        }),
        fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: forecastQuery }),
        }),
        fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: statsQuery }),
        }),
        fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trendsQuery }),
        }),
      ]);

      const [weatherResult, forecastResult, statsResult, trendsResult] = await Promise.all([
        weatherRes.json(),
        forecastRes.json(),
        statsRes.json(),
        trendsRes.json(),
      ]);

      // Проверяем ошибки в weather запросе
      if (weatherResult.errors) {
        throw new Error(weatherResult.errors[0].message);
      }

      const weatherData = language === 'ru' ? 
        weatherResult.data.getWeatherRU : 
        weatherResult.data.getWeather;
      
      if (!weatherData) {
        throw new Error(`Не удалось получить данные о погоде для города "${cityName}"`);
      }

      console.log('📦 Полученные данные о погоде:', weatherData);
      console.log('🌦️ weathercode из ответа:', weatherData.weathercode);
      console.log('🌦️ icon из ответа:', weatherData.icon);

      setWeather(weatherData);
      setForecast(forecastResult.data.getForecast?.forecast || []);
      console.log('📋 Полученные данные прогноза:', forecastResult.data.getForecast?.forecast);
      setStats(statsResult.data.getCityStats);
      setTrends(trendsResult.data.getCityTrends || []);
      setActiveTab('weather');
      
      // Обновляем историю и популярные города
      fetchRecentHistory();
      fetchPopularCities();
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Произошла ошибка при получении данных');
      
      // Показываем подсказку для русского ввода
      if (language === 'ru' && error.message?.includes('английское')) {
        setError(`${error.message}. Попробуйте: Москва -> Moscow, Санкт-Петербург -> Saint Petersburg`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (citySuggestion: CitySuggestion) => {
    const displayName = citySuggestion.localName || citySuggestion.name;
    setCity(displayName);
    setSuggestions([]);
    fetchWeather(citySuggestion.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    searchCities(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && city.trim()) {
      fetchWeather(city);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>🌤️ Advanced Weather Analytics</h1>
            <p>Полная информация о погоде и аналитика запросов</p>
            <p className="language-hint">Можно вводить города на русском или английском языке</p>
          </div>
          <button 
            onClick={toggleTheme}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              fontSize: '24px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={theme === 'light' ? 'Включить темную тему' : 'Включить светлую тему'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Введите город на русском или английском..."
            value={city}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button onClick={() => city.trim() && fetchWeather(city)} disabled={loading || !city.trim()}>
            {loading ? 'Загрузка...' : 'Показать погоду'}
          </button>
          
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleCitySelect(suggestion)}
                >
                  <div className="suggestion-main">
                    <span className="suggestion-name">{suggestion.localName || suggestion.name}</span>
                    {suggestion.state && (
                      <span className="suggestion-state">, {suggestion.state}</span>
                    )}
                  </div>
                  <div className="suggestion-country">{suggestion.country}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
            {detectLanguage(city) === 'ru' && (
              <p className="language-tip">
                💡 Попробуйте английское название или выберите город из списка выше
              </p>
            )}
          </div>
        )}

        <div className="popular-cities">
          <span>Популярные города: </span>
          {popularCities.map((popularCity, index) => (
            <button
              key={index}
              className="city-chip"
              onClick={() => fetchWeather(popularCity.city)}
              disabled={loading}
            >
              {popularCity.city} ({popularCity.requests})
            </button>
          ))}
        </div>
      </div>

      <nav className="tabs">
        <button
          className={activeTab === 'weather' ? 'active' : ''}
          onClick={() => setActiveTab('weather')}
        >
          Текущая погода
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          История запросов
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Аналитика
        </button>
      </nav>

      {activeTab === 'weather' && (
        <div className="weather-container">
          {weather ? (
            <>
          <div className="current-weather">
            <div className="weather-header">
              <div>
                <h2>{weather.city}, {weather.country}</h2>
                {weather.originalQuery && weather.originalQuery !== weather.city && (
                  <p className="original-query">
                    Вы искали: "{weather.originalQuery}" • Найден город: {weather.city}
                  </p>
                )}
              </div>
              {weather.icon && (
                <>
                  {console.log('🎨 Рендерим иконку текущей погоды. weathercode:', weather.weathercode, 'icon:', weather.icon)}
                  <img 
                    src={getIconWeather(weather.weathercode || 0).src} 
                    alt={weather.description}
                    title={getIconWeather(weather.weathercode || 0).title}
                    className="weather-icon-large"
                  />
                </>
              )}
            </div>
            
            <div className="weather-grid">
              <div className="weather-card main">
                <h3>Температура</h3>
                <div className="temp-main">{weather.temperature.toFixed(1)}°C</div>
                <div className="temp-details">
                  <span>Ощущается: {weather.feels_like.toFixed(1)}°C</span>
                  <span>Мин: {weather.temp_min.toFixed(1)}°C</span>
                  <span>Макс: {weather.temp_max.toFixed(1)}°C</span>
                </div>
              </div>
              
              <div className="weather-card main">
                <h3>Влажность</h3>
                <div className="humidity">{weather.humidity}%</div>
              </div>
              
              <div className="weather-card main">
                <h3>Давление</h3>
                <div className="pressure">{weather.pressure} hPa</div>
              </div>
              
              <div className="weather-card main">
                <h3>Ветер</h3>
                <div className="wind">{weather.wind_speed} m/s</div>
              </div>
              
              <div className="weather-card main description">
                <h3>Состояние</h3>
                <div className="desc">{getIconWeather(weather.weathercode || 0).title}</div>
              </div>
            </div>
          </div>

          {forecast.length > 0 && (
            <div className="forecast">
              <h3>Прогноз на 5 дней</h3>
              <div className="forecast-grid">
                {forecast.map((day, index) => {
                  console.log(`📅 День ${index}: weathercode=${day.weathercode}, icon=${day.icon}`);
                  return (
                  <div key={index} className="forecast-day">
                    <div className="forecast-date">{formatDate(day.date)}</div>
                    <img 
                      src={getIconWeather(day.weathercode || 0).src} 
                      alt={day.mostCommonDescription}
                      title={getIconWeather(day.weathercode || 0).title}
                      className="forecast-icon"
                    />
                    <div className="forecast-temp">
                      <span className="max">{day.maxTemp}°</span>
                      <span className="min">{day.minTemp}°</span>
                    </div>
                    <div className="forecast-desc">{day.mostCommonDescription}</div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {stats && (
            <div className="city-stats">
              <h3>Статистика по городу (30 дней)</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Средняя температура</div>
                  <div className="stat-value">{stats.avgTemp?.toFixed(1)}°C</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Максимальная</div>
                  <div className="stat-value">{stats.maxTemp?.toFixed(1)}°C</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Минимальная</div>
                  <div className="stat-value">{stats.minTemp?.toFixed(1)}°C</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Средняя влажность</div>
                  <div className="stat-value">{stats.avgHumidity?.toFixed(0)}%</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Всего запросов</div>
                  <div className="stat-value">{stats.totalRequests}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Частая погода</div>
                  <div className="stat-value">{stats.mostCommonDescription}</div>
                </div>
              </div>
            </div>
          )}
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <p>Введите город для получения информации о погоде</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-container">
          <h2>История запросов</h2>
          <button 
            className="refresh-button"
            onClick={fetchRecentHistory}
          >
            Обновить историю
          </button>
          <div className="history-list">
            {history.length > 0 ? (
              history.map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-city">{entry.city}</div>
                  <div className="history-temp">{entry.temperature.toFixed(1)}°C</div>
                  <div className="history-desc">{entry.description}</div>
                  <div className="history-date">
                    {new Date(entry.date).toLocaleString('ru-RU')}
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-history">История запросов пуста</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-container">
          <h2>Аналитика погоды</h2>
          
          {weather ? (
          <div className="charts-grid">
            {trends.length > 0 && (
              <div className="chart-container">
                <h3>Тренды температуры (7 дней)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(1)}°C`, 'Температура']}
                      labelFormatter={(label) => `Дата: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avgTemp" 
                      stroke="#8884d8" 
                      name="Средняя" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="maxTemp" 
                      stroke="#82ca9d" 
                      name="Максимальная" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="minTemp" 
                      stroke="#ffc658" 
                      name="Минимальная" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {popularCities.length > 0 && (
              <div className="chart-container">
                <h3>Популярные города</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={popularCities}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} запросов`, 'Количество']}
                      labelFormatter={(label) => `Город: ${label}`}
                    />
                    <Bar 
                      dataKey="requests" 
                      fill="#8884d8" 
                      name="Запросы"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {weather && (
              <div className="chart-container">
                <h3>Параметры погоды</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Температура', value: weather.temperature, label: `${weather.temperature.toFixed(1)}°C` },
                        { name: 'Влажность', value: weather.humidity, label: `${weather.humidity}%` },
                        { name: 'Давление', value: weather.pressure / 100, label: `${(weather.pressure / 100).toFixed(1)} гПа` },
                        { name: 'Ветер', value: weather.wind_speed * 10, label: `${weather.wind_speed} м/с` },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.label}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'Температура' ? `${value}°C` : 
                        name === 'Влажность' ? `${value}%` :
                        name === 'Давление' ? `${(Number(value) * 100).toFixed(0)} гПа` :
                        name === 'Ветер' ? `${(Number(value) / 10).toFixed(1)} м/с` : value,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <p>Введите город для получения аналитики</p>
            </div>
          )}
        </div>
      )}

      <footer className="footer">
        <p>Weather Analytics System © 2024 | Powered by Open-Meteo</p>
        <p className="footer-info">Система поддерживает ввод городов на русском и английском языках</p>
      </footer>
    </div>
  );
}

export default App;