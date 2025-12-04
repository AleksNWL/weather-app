import React from 'react';
import { ActiveTab } from '../../types/index';
import './Navigation.css';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="tabs">
      <button
        className={activeTab === 'weather' ? 'active' : ''}
        onClick={() => onTabChange('weather')}
      >
        Текущая погода
      </button>
      <button
        className={activeTab === 'history' ? 'active' : ''}
        onClick={() => onTabChange('history')}
      >
        История запросов
      </button>
      <button
        className={activeTab === 'analytics' ? 'active' : ''}
        onClick={() => onTabChange('analytics')}
      >
        Аналитика
      </button>
    </nav>
  );
};
