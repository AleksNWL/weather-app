import React, { useState, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header/Header';
import { SearchBox } from './components/SearchBox/SearchBox';
import { Navigation } from './components/Navigation/Navigation';
import { Weather } from './components/Weather/Weather';
import { Forecast } from './components/Forecast/Forecast';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
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
  ActiveTab,
} from './types';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState<CityStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [popularCities, setPopularCities] = useState<PopularCity[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('weather');
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
      setActiveTab('weather');

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

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'weather' && (
        <>
          <Weather weather={weather} stats={stats} />
          <Forecast forecast={forecast} />
        </>
      )}

      {activeTab === 'history' && (
        <HistoryPage history={history} onRefresh={fetchRecentHistory} />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsPage weather={weather} trends={trends} popularCities={popularCities} />
      )}

      <Footer />
    </div>
  );
}

export default App;
