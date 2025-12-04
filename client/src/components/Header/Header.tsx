import React from 'react';
import { Theme } from '../../types/index';
import './Header.css';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  return (
    <header className="header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🌤️ Advanced Weather Analytics</h1>
          <p>Полная информация о погоде и аналитика запросов</p>
          <p className="language-hint">Можно вводить города на русском или английском языке</p>
        </div>
        <button
          onClick={onToggleTheme}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            fontSize: '24px',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={theme === 'light' ? 'Включить темную тему' : 'Включить светлую тему'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};
