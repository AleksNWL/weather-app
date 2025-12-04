import React from 'react';
import { WeatherData, CityStats } from '../../types/index';
import getIconWeather from '../../utils/getIconWeather';
import './Weather.css';

interface WeatherProps {
  weather: WeatherData | null;
  stats: CityStats | null;
}

export const Weather: React.FC<WeatherProps> = ({ weather, stats }) => {
  if (!weather) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p>Введите город для получения информации о погоде</p>
      </div>
    );
  }

  return (
    <div className="weather-container">
      <div className="current-weather">
        <div className="weather-header">
          <div>
            <h2>
              {weather.city}, {weather.country}
            </h2>
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
    </div>
  );
};
