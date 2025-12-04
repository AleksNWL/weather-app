import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WeatherData, PopularCity, TrendData } from '../../types/index';
import { CHART_COLORS } from '../../constants/index';
import './Analytics.css';

interface AnalyticsProps {
  weather: WeatherData | null;
  trends: TrendData[];
  popularCities: PopularCity[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ weather, trends, popularCities }) => {
  if (!weather) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p>Введите город для получения аналитики</p>
      </div>
    );
  }

  return (
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
              {CHART_COLORS.map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                name === 'Температура'
                  ? `${value}°C`
                  : name === 'Влажность'
                  ? `${value}%`
                  : name === 'Давление'
                  ? `${(Number(value) * 100).toFixed(0)} гПа`
                  : name === 'Ветер'
                  ? `${(Number(value) / 10).toFixed(1)} м/с`
                  : value,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
