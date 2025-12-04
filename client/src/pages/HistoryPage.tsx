import React from 'react';
import { HistoryEntry } from '../types/index';
import './HistoryPage.css';

interface HistoryPageProps {
  history: HistoryEntry[];
  onRefresh: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ history, onRefresh }) => {
  return (
    <div className="history-container">
      <h2>История запросов</h2>
      <button className="refresh-button" onClick={onRefresh}>
        Обновить историю
      </button>
      <div className="history-list">
        {history.length > 0 ? (
          history.map((entry, index) => (
            <div key={index} className="history-item">
              <div className="history-city">{entry.city}</div>
              <div className="history-temp">{entry.temperature.toFixed(1)}°C</div>
              <div className="history-desc">{entry.description}</div>
              <div className="history-date">
                {new Date(entry.date).toLocaleString('ru-RU')}
              </div>
            </div>
          ))
        ) : (
          <p className="empty-history">История запросов пуста</p>
        )}
      </div>
    </div>
  );
};
