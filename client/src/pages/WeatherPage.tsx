import React from 'react';
import { Weather } from '../components/Weather/Weather';
import { Forecast } from '../components/Forecast/Forecast';
import { WeatherData, ForecastDay, CityStats } from '../types/index';
import './WeatherPage.css';

interface WeatherPageProps {
  weather: WeatherData | null;
  stats: CityStats | null;
  forecast: ForecastDay[];
  loading: boolean;
}

export const WeatherPage: React.FC<WeatherPageProps> = ({
  weather,
  stats,
  forecast,
  loading,
}) => {
  if (loading) {
    return (
      <div className="weather-page">
        <div className="loading">Загрузка данных о погоде...</div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-page">
        <div className="empty-state">
          <p>Выберите город для просмотра текущей погоды</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-page">
      <Weather weather={weather} stats={stats} />
      <Forecast forecast={forecast} />
    </div>
  );
};
