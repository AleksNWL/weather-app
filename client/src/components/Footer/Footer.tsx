import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>Weather Analytics System © 2024 | Powered by Open-Meteo</p>
      <p className="footer-info">
        Система поддерживает ввод городов на русском и английском языках
      </p>
    </footer>
  );
};
