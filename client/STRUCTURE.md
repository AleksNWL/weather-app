# Weather App - Client Structure

## Новая структура папок

```
src/
├── components/              # Переиспользуемые компоненты
│   ├── Header/             # Заголовок с переключением темы
│   ├── SearchBox/          # Поле поиска и список популярных городов
│   ├── Navigation/         # Вкладки навигации
│   ├── Weather/            # Текущая погода и статистика
│   ├── Forecast/           # Прогноз погоды на 5 дней
│   ├── Analytics/          # Графики и аналитика
│   ├── Footer/             # Подвал приложения
│   └── index.ts            # Экспорты всех компонентов
│
├── pages/                  # Страницы (основные view контейнеры)
│   ├── HistoryPage.tsx     # Страница истории запросов
│   ├── AnalyticsPage.tsx   # Страница с аналитикой
│   └── index.ts            # Экспорты страниц
│
├── hooks/                  # Кастомные React хуки
│   ├── useTheme.ts         # Хук для управления темой
│   └── index.ts            # Экспорты хуков
│
├── services/               # API сервисы и логика запросов
│   ├── weatherService.ts   # Все GraphQL запросы к API
│   └── index.ts            # Экспорты сервисов
│
├── types/                  # TypeScript типы и интерфейсы
│   └── index.ts            # Все типы приложения
│
├── constants/              # Константы приложения
│   └── index.ts            # API URL, лимиты, цвета графиков
│
├── utils/                  # Утилиты и вспомогательные функции
│   ├── getIconWeather.ts   # Функция для получения иконки погоды
│   └── index.ts            # Экспорты утилит
│
├── styles/                 # Глобальные стили (зарезервировано)
│
├── App.tsx                 # Главный компонент приложения
├── App.css                 # Все стили приложения
├── index.tsx               # Точка входа
└── react-app-env.d.ts      # Типы окружения
```

## Описание изменений

### Компоненты (components/)
Каждый компонент имеет собственную папку с файлом `.tsx` и пустым `.css` файлом (все стили в App.css).

- **Header** - Заголовок с логотипом и кнопкой переключения темы
- **SearchBox** - Поле ввода города и список популярных городов
- **Navigation** - Вкладки для переключения между разделами
- **Weather** - Отображение текущей погоды и статистики
- **Forecast** - Прогноз на 5 дней
- **Analytics** - Графики температурных тренов, популярных городов
- **Footer** - Подвал приложения

### Страницы (pages/)
Полноценные страницы приложения:
- **HistoryPage** - История запросов о погоде
- **AnalyticsPage** - Подробная аналитика

### Сервисы (services/)
- **weatherService.ts** - Все GraphQL запросы к API централизованы в одном месте

### Хуки (hooks/)
- **useTheme.ts** - Управление темой приложения (светлая/темная)

### Типы и константы
- **types/index.ts** - Все TypeScript интерфейсы в одном месте
- **constants/index.ts** - Все глобальные константы (API URL, лимиты, цвета)

## Преимущества новой структуры

✅ **Масштабируемость** - легко добавлять новые компоненты и страницы
✅ **Переиспользуемость** - компоненты изолированы и легко переиспользуются
✅ **Удобство разработки** - четкое разделение ответственности
✅ **Быстрая навигация** - легко найти нужный файл
✅ **Минимум импортов** - index.ts файлы упрощают импорты
✅ **Централизованная логика** - все API запросы в одном сервисе

## Импорты

### Правильные способы импортов:

```tsx
// Компоненты
import { Header } from './components/Header/Header';

// Типы
import { WeatherData } from './types/index';

// Сервисы
import { weatherService } from './services/weatherService';

// Хуки
import { useTheme } from './hooks/useTheme';

// Константы
import { API_URL } from './constants/index';

// Утилиты
import getIconWeather from './utils/getIconWeather';
```

Или используя index файлы:

```tsx
import { Header } from './components';
import { WeatherData } from './types';
import { weatherService } from './services';
import { useTheme } from './hooks';
import { getIconWeather } from './utils';
```
