import React from 'react';
import { ForecastDay } from '../../types/index';
import getIconWeather from '../../utils/getIconWeather';
import './Forecast.css';

interface ForecastProps {
  forecast: ForecastDay[];
}

export const Forecast: React.FC<ForecastProps> = ({ forecast }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  if (forecast.length === 0) {
    return null;
  }

  return (
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
  );
};
