import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Header } from './components/Header/Header';
import { SearchBox } from './components/SearchBox/SearchBox';
import { Navigation } from './components/Navigation/Navigation';
import { Footer } from './components/Footer/Footer';
import { useTheme } from './hooks/useTheme';
import { weatherService } from './services/weatherService';
import {
  WeatherData,
  ForecastDay,
  HistoryEntry,
  CityStats,
  PopularCity,
  TrendData,
} from './types/index';
import { WeatherPage, HistoryPage, AnalyticsPage } from './pages/index';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<CityStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [popularCities, setPopularCities] = useState<PopularCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка популярных городов и истории при загрузке
  useEffect(() => {
    fetchPopularCities();
    fetchRecentHistory();
  }, []);

  const fetchPopularCities = async () => {
    try {
      const data = await weatherService.fetchPopularCities();
      setPopularCities(data);
    } catch (error) {
      console.error('Error fetching popular cities:', error);
    }
  };

  const fetchRecentHistory = async () => {
    try {
      const data = await weatherService.fetchHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    setWeather(null);
    setForecast([]);
    setStats(null);
    setTrends([]);

    try {
      const [weatherData, forecastData, statsData, trendsData] = await Promise.all([
        weatherService.fetchWeather(cityName),
        weatherService.fetchForecast(cityName),
        weatherService.fetchStats(cityName),
        weatherService.fetchTrends(cityName),
      ]);

      console.log('📦 Полученные данные о погоде:', weatherData);
      console.log('🌦️ weathercode из ответа:', weatherData.weathercode);
      console.log('📋 Полученные данные прогноза:', forecastData);

      setWeather(weatherData);
      setForecast(forecastData);
      setStats(statsData);
      setTrends(trendsData);

      // Обновляем историю и популярные города
      fetchRecentHistory();
      fetchPopularCities();
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Произошла ошибка при получении данных');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setCity(value);
  };

  return (
    <Router>
      <div className="app">
        <Header theme={theme} onToggleTheme={toggleTheme} />

        <SearchBox
          city={city}
          onCityChange={handleInputChange}
          onSearch={fetchWeather}
          loading={loading}
          error={error}
          popularCities={popularCities}
        />

        <Navigation />

        <Routes>
          <Route
            path="/"
            element={
              <WeatherPage
                weather={weather}
                stats={stats}
                forecast={forecast}
                loading={loading}
              />
            }
          />
          <Route
            path="/weather"
            element={
              <WeatherPage
                weather={weather}
                stats={stats}
                forecast={forecast}
                loading={loading}
              />
            }
          />
          <Route
            path="/history"
            element={<HistoryPage history={history} onRefresh={fetchRecentHistory} />}
          />
          <Route
            path="/analytics"
            element={
              <AnalyticsPage
                weather={weather}
                trends={trends}
                popularCities={popularCities}
              />
            }
          />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
