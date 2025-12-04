import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || (path === '/' && location.pathname === '');
  };

  return (
    <nav className="tabs">
      <Link
        to="/"
        className={isActive('/') || isActive('/weather') ? 'active' : ''}
      >
        Текущая погода
      </Link>
      <Link
        to="/history"
        className={isActive('/history') ? 'active' : ''}
      >
        История запросов
      </Link>
      <Link
        to="/analytics"
        className={isActive('/analytics') ? 'active' : ''}
      >
        Аналитика
      </Link>
    </nav>
  );
};
