import React from 'react';
import { PopularCity } from '../../types/index';
import './SearchBox.css';

interface SearchBoxProps {
  city: string;
  onCityChange: (value: string) => void;
  onSearch: (city: string) => void;
  loading: boolean;
  error: string | null;
  popularCities: PopularCity[];
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  city,
  onCityChange,
  onSearch,
  loading,
  error,
  popularCities,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && city.trim()) {
      onSearch(city);
    }
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Введите город на русском или английском..."
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button onClick={() => city.trim() && onSearch(city)} disabled={loading || !city.trim()}>
          {loading ? 'Загрузка...' : 'Показать погоду'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="popular-cities">
        <span>Популярные города: </span>
        {popularCities.map((popularCity, index) => (
          <button
            key={index}
            className="city-chip"
            onClick={() => onSearch(popularCity.city)}
            disabled={loading}
          >
            {popularCity.city} ({popularCity.requests})
          </button>
        ))}
      </div>
    </div>
  );
};
