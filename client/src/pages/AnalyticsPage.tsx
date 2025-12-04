import React from 'react';
import { Analytics } from '../components/Analytics/Analytics';
import { WeatherData, PopularCity, TrendData } from '../types/index';
import './AnalyticsPage.css';

interface AnalyticsPageProps {
  weather: WeatherData | null;
  trends: TrendData[];
  popularCities: PopularCity[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  weather,
  trends,
  popularCities,
}) => {
  return (
    <div className="analytics-container">
      <h2>Аналитика погоды</h2>
      {weather ? (
        <Analytics weather={weather} trends={trends} popularCities={popularCities} />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <p>Введите город для получения аналитики</p>
        </div>
      )}
    </div>
  );
};
