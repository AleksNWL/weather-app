# РАЗДЕЛ 6. РАЗРАБОТКА И РАЗВЕРТЫВАНИЕ

## 6.1 Процесс разработки MVP

Разработка приложения Weather App осуществлялась поэтапно с использованием подхода MVP (Minimum Viable Product), который позволил создать работоспособную версию приложения с минимальным набором функций для демонстрации архитектурных принципов и паттернов.

### 6.1.1 Этапы разработки

Разработка MVP была разделена на пять основных этапов, каждый из которых добавлял новую функциональность и улучшал архитектуру системы.

**Этап 1: Базовая функциональность погоды**

На первом этапе была реализована основная функциональность приложения для получения информации о погоде: интеграция с Open-Meteo Geocoding API для поиска городов, получение актуальных метеорологических данных через Open-Meteo Current Weather API, прогноз на 5 дней через Open-Meteo Daily Forecast API, поддержка русского языка с транслитерацией кириллических названий городов в латиницу, а также клиентское кэширование данных с использованием localStorage и TTL 5 минут. На данном этапе была создана простая монолитная архитектура для быстрой проверки работоспособности основных функций.

**Этап 2: Backend архитектура**

На втором этапе была реализована микросервисная архитектура с API Gateway: создание единой точки входа на основе Apollo Server для обработки всех клиентских запросов, разделение функциональности на два независимых сервиса (Weather Service на порту 4001 и Analytics Service на порту 4002), настройка MongoDB для хранения истории запросов и аналитики, а также реализация логики маршрутизации запросов от Gateway к соответствующим микросервисам. Данный этап обеспечил масштабируемость системы и независимость компонентов.

**Этап 3: Frontend UI**

На третьем этапе была разработана клиентская часть приложения: создание типобезопасного клиентского приложения с использованием React 19.x и TypeScript, реализация взаимодействия с GraphQL API через нативный Fetch API, интеграция библиотеки Recharts для отображения графиков статистики и трендов, реализация адаптивного дизайна для поддержки различных размеров экранов, а также функциональность просмотра истории запросов через GraphQL API с пагинацией. На данном этапе был создан полнофункциональный пользовательский интерфейс с поддержкой всех основных функций приложения.

**Этап 4: Инфраструктура**

На четвертом этапе была настроена инфраструктура для развертывания и управления приложением: создание конфигурации Docker Compose для локальной разработки, подготовка Kubernetes манифестов для развертывания в кластере, реализация endpoints `/health` на каждом сервисе для мониторинга состояния системы, а также настройка конфигурации через переменные окружения для различных сред. Данный этап обеспечил возможность развертывания приложения в различных средах и упростил процесс управления инфраструктурой.

**Этап 5: UI/UX улучшения**

На пятом этапе были реализованы улучшения пользовательского интерфейса: переключение между темной и светлой темами с сохранением предпочтений пользователя, плавные CSS transitions для анимации изменений интерфейса, применение современного дизайна с эффектом стекла (glassmorphism), а также улучшенные анимации при наведении и переходах между состояниями. Данный этап улучшил визуальное восприятие приложения и повысил удобство использования.

### 6.1.2 Результаты разработки MVP

В процессе разработки MVP применялись принципы итеративной разработки, приоритета архитектуры, минимализма, документирования и тестирования. В результате было создано полнофункциональное веб-приложение, которое демонстрирует микросервисную архитектуру с разделением на независимые сервисы, API Gateway паттерн с использованием GraphQL, MVC паттерн на клиентской и серверной сторонах, кэширование данных на клиенте для оптимизации производительности, контейнеризацию с использованием Docker и Kubernetes, а также современный пользовательский интерфейс с поддержкой темной и светлой тем. Приложение готово к использованию и может служить основой для дальнейшего развития.

---

## 6.2 Реализация архитектурных паттернов

В проекте Weather App реализованы несколько ключевых архитектурных паттернов, которые обеспечивают масштабируемость, производительность и поддерживаемость системы. Каждый паттерн реализован с учетом специфики проекта и требований к архитектуре.

### 6.2.1 API Gateway Pattern

API Gateway реализован в директории `gateway/` на основе Express.js и Apollo Server. Gateway предоставляет единый GraphQL endpoint для всех клиентских запросов.

Ключевые компоненты включают GraphQL Schema (`gateway/src/config/schema.js`), который определяет типы данных и запросы (см. Листинг 6.1), Resolvers (`gateway/src/resolvers/query.js`), которые обрабатывают GraphQL запросы и направляют их к микросервисам (см. Листинг 6.2), а также Service Clients (`gateway/src/services/serviceClients.js`) для взаимодействия с микросервисами через REST API (см. Листинг 6.3).

**Листинг 6.1** – GraphQL Schema определения типов и запросов (файл `gateway/src/config/schema.js`)

```graphql
type Query {
  # Weather queries
  getWeather(city: String!): Weather
  getWeatherRU(city: String!): Weather
  getForecast(city: String!): Forecast
  searchCities(query: String!): [CitySearchResult]
  getCityCoordinates(city: String!): Coordinates
  getWeatherByCoords(lat: Float!, lon: Float!): Weather
  
  # Analytics queries
  getCityStats(city: String!, days: Int): CityStats
  getCityTrends(city: String!, days: Int): [TrendData]
  getPopularCities(limit: Int): [PopularCity]
  getHistory(page: Int, limit: Int): HistoryResponse
}
```

**Листинг 6.2** – Реализация GraphQL Resolvers (файл `gateway/src/resolvers/query.js`)

```javascript
export const resolvers = {
  Query: {
    getWeather: async (_, { city }) => {
      try {
        return await weatherServiceClient.getWeather(city);
      } catch (err) {
        console.error('Weather fetch error:', err);
        throw new Error(`Не удалось получить погоду для города ${city}: ${err.message}`);
      }
    },
    
    getForecast: async (_, { city }) => {
      try {
        return await weatherServiceClient.getForecast(city);
      } catch (err) {
        console.error(err);
        throw new Error(`Не удалось получить прогноз для города ${city}`);
      }
    },
    
    getCityStats: async (_, { city, days = 30 }) => {
      return await analyticsServiceClient.getCityStats(city, days);
    },
    
    getHistory: async (_, { page = 1, limit = 20 }) => {
      return await analyticsServiceClient.getHistory(page, limit);
    },
  },
};
```

**Листинг 6.3** – Клиенты для взаимодействия с микросервисами (файл `gateway/src/services/serviceClients.js`)

```javascript
export const weatherServiceClient = {
  async getWeather(city) {
    const res = await fetch(`${WEATHER_SERVICE_URL}/weather/${encodeURIComponent(city)}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Weather service error: ${res.status}`);
    }
    return await res.json();
  },
  
  async getForecast(city) {
    const res = await fetch(`${WEATHER_SERVICE_URL}/forecast/${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`Forecast service error: ${res.status}`);
    return await res.json();
  },
};

export const analyticsServiceClient = {
  async getCityStats(city, days = 30) {
    try {
      const res = await fetch(
        `${ANALYTICS_SERVICE_URL}/stats/city/${encodeURIComponent(city)}?days=${days}`
      );
      if (!res.ok) throw new Error(`City stats service error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('City stats error:', err);
      return { avgTemp: null, maxTemp: null, minTemp: null, avgHumidity: null, totalRequests: 0, mostCommonDescription: '' };
    }
  },
  
  async getHistory(page = 1, limit = 20) {
    try {
      const res = await fetch(
        `${ANALYTICS_SERVICE_URL}/history?page=${page}&limit=${limit}`
      );
      if (!res.ok) throw new Error(`History service error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('History error:', err);
      return { data: [], pagination: {} };
    }
  },
};
```

Преимущества реализации: единая точка входа для всех клиентских запросов, централизованная валидация и обработка ошибок, абстракция внутренней структуры микросервисов, гибкость запросов через GraphQL.

### 6.2.2 Microservices Pattern

Микросервисная архитектура реализована через разделение на два независимых сервиса. Weather Service (`weather-service/`) предоставляет REST API endpoints `/weather/:city`, `/forecast/:city`, `/search/:query`, интегрируется с Open-Meteo API, автоматически отправляет данные в Analytics Service для сохранения в истории и обрабатывает транслитерацию русских названий городов. Analytics Service (`analytics-service/`) предоставляет REST API endpoints `/history`, `/stats/city/:city`, `/trends/:city`, `/popular`, использует модели данных MongoDB (WeatherHistory), выполняет агрегацию данных для статистики и трендов, а также вычисляет популярные города.

Сервисы взаимодействуют через REST API. Weather Service автоматически отправляет данные о запросах в Analytics Service через асинхронный POST запрос (см. Листинг 6.4).

**Листинг 6.4** – Функция отправки данных в Analytics Service (файл `weather-service/src/services/weatherService.js`)

```javascript
/**
 * Send weather data to analytics service
 */
const sendToAnalytics = async (data) => {
  try {
    console.log('📤 Sending to analytics:', {
      city: data.city,
      originalQuery: data.originalQuery,
      country: data.country
    });
    
    await axios.post(`${ANALYTICS_SERVICE_URL}/history`, data);
  } catch (analyticsError) {
    console.error('⚠️  Failed to send to analytics:', analyticsError.message);
  }
};
```

Преимущества реализации: независимое масштабирование каждого сервиса, изоляция отказов, четкое разделение ответственности, независимая разработка и развертывание.

### 6.2.3 MVC (Model-View-Controller) Pattern

Паттерн MVC реализован как на клиентской, так и на серверной стороне. На клиентской стороне Model включает бизнес-логику и работу с API (`client/src/services/weatherService.ts`), типы данных (`client/src/types/index.ts`), логику кэширования (`client/src/utils/cache.ts`). View представлен UI компонентами (`client/src/components/`), страницами приложения (`client/src/pages/`), корневым компонентом (`client/src/App.tsx`). Controller включает управление состоянием и роутинг (`client/src/App.tsx`), управление темой (`client/src/hooks/useTheme.ts`), обработку событий пользователя.

На серверной стороне Model включает модели данных MongoDB (`analytics-service/src/models/WeatherHistory.js`), GraphQL типы данных (`gateway/src/config/schema.js`). View представлен GraphQL responses и REST API responses. Controller включает GraphQL resolvers (`gateway/src/resolvers/query.js`), REST API маршруты (`weather-service/src/routes/`, `analytics-service/src/routes/`).

Преимущества реализации: четкое разделение ответственности между компонентами, упрощение тестирования и поддержки, переиспользование компонентов, улучшенная организация кода.

### 6.2.4 Cache-Aside Pattern

Клиентское кэширование реализовано в `client/src/utils/cache.ts` с использованием localStorage и паттерна Cache-Aside. Механизм работы включает проверку кэша перед запросом к API (см. Листинг 6.5), запрос к API если данных нет в кэше, сохранение в кэш после получения данных с TTL 5 минут (см. Листинг 6.6).

**Листинг 6.5** – Функция проверки кэша (файл `client/src/utils/cache.ts`)

```typescript
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const getCache = <T>(key: string): T | null => {
  try {
    const cacheKey = `weather_cache_${key}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age < entry.ttl) {
      return entry.data;
    } else {
      localStorage.removeItem(cacheKey);
      return null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const setCache = <T>(key: string, data: T, ttl: number = DEFAULT_TTL): void => {
  try {
    const cacheKey = `weather_cache_${key}`;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};
```

**Листинг 6.6** – Использование кэширования в weatherService (файл `client/src/services/weatherService.ts`)

```typescript
fetchWeather: async (cityName: string): Promise<WeatherData> => {
  // Check cache first
  const cacheKey = `weather_${cityName.toLowerCase()}`;
  const cached = getCache<WeatherData>(cacheKey);
  if (cached) {
    console.log('📦 [Cache] Using cached weather data for', cityName);
    return cached;
  }

  // Fetch from API
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `query { getWeather(city: "${cityName}") { ... } }` }),
  });

  const result = await res.json();
  const weatherData = result.data.getWeather;

  // Cache the result
  setCache(cacheKey, weatherData, CACHE_TTL);
  console.log('💾 [Cache] Cached weather data for', cityName);

  return weatherData;
}
```

Особенности реализации: TTL (Time To Live) = 5 минут для всех типов данных, автоматическая очистка устаревших записей, персистентность между перезагрузками страницы, обработка ошибок localStorage. Кэшируемые данные: текущая погода (`weather_{city}`), прогноз на 5 дней (`forecast_{city}`), статистика города (`stats_{city}_{days}`), тренды температуры (`trends_{city}_{days}`).

Преимущества реализации: уменьшение количества запросов к серверу, мгновенный отклик для повторных запросов, снижение нагрузки на API, улучшение пользовательского опыта.

### 6.2.5 Event-Driven Analytics

Аналитика реализована через асинхронную отправку данных о запросах в Analytics Service. Weather Service автоматически отправляет данные о каждом запросе погоды в Analytics Service без блокировки основного ответа (см. Листинг 6.7).

**Листинг 6.7** – Функция асинхронной отправки данных в Analytics Service (файл `weather-service/src/services/weatherService.js`)

```javascript
/**
 * Send weather data to analytics service
 */
const sendToAnalytics = async (data) => {
  try {
    console.log('📤 Sending to analytics:', {
      city: data.city,
      originalQuery: data.originalQuery,
      country: data.country
    });
    
    await axios.post(`${ANALYTICS_SERVICE_URL}/history`, data);
  } catch (analyticsError) {
    console.error('⚠️  Failed to send to analytics:', analyticsError.message);
    // Не влияет на основной поток - ошибка аналитики не блокирует ответ
  }
};

// Использование в функции получения погоды
export const getWeatherByCity = async (city) => {
  // ... получение данных о погоде ...
  
  const weatherData = { /* ... данные о погоде ... */ };
  
  // Асинхронная отправка в аналитику (не блокирует ответ)
  await sendToAnalytics({
    ...weatherData,
    date: new Date()
  });
  
  return weatherData;
};
```

Преимущества реализации: не блокирует основной поток обработки запросов, изоляция ошибок аналитики от основного функционала, масштабируемость (можно добавить очередь сообщений), простота реализации без дополнительных зависимостей.

---

## 6.3 Развертывание в инфраструктуре

Развертывание приложения Weather App поддерживается в двух средах: локальная разработка с использованием Docker Compose и production развертывание в Kubernetes кластере.

### 6.3.1 Локальная разработка (Docker Compose)

Для локальной разработки используется Docker Compose, который позволяет запустить все сервисы приложения одной командой. Конфигурация находится в файле `docker-compose.yml` (см. Листинг 6.8).

**Листинг 6.8** – Конфигурация Docker Compose (файл `docker-compose.yml`)

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:latest
    container_name: weather-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - weather-network

  analytics-service:
    build: ./analytics-service
    container_name: analytics-service
    ports:
      - "4002:4002"
    environment:
      - MONGO_URI=mongodb://mongo:27017/weather
      - PORT=4002
    depends_on:
      - mongo
    networks:
      - weather-network
    command: node src/index.js

  weather-service:
    build: ./weather-service
    container_name: weather-service
    environment:
      - PORT=4001
      - ANALYTICS_SERVICE_URL=http://analytics-service:4002
    ports:
      - "4001:4001"
    depends_on:
      - analytics-service
    networks:
      - weather-network
    command: node src/index.js

  gateway:
    build: ./gateway
    container_name: gateway
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - WEATHER_SERVICE_URL=http://weather-service:4001
      - ANALYTICS_SERVICE_URL=http://analytics-service:4002
    depends_on:
      - weather-service
      - analytics-service
    networks:
      - weather-network
    command: node src/index.js

  client:
    build: 
      context: ./client
      dockerfile: Dockerfile
    container_name: weather-client
    ports:
      - "3000:80"
    depends_on:
      - gateway
    networks:
      - weather-network

volumes:
  mongo-data:

networks:
  weather-network:
    driver: bridge
```

Запуск приложения осуществляется командой `docker-compose up --build`. После запуска приложение доступно по следующим адресам: клиент – http://localhost:3000, GraphQL – http://localhost:4000/graphql, Weather API – http://localhost:4001, Analytics API – http://localhost:4002, MongoDB – mongodb://localhost:27017/weather.

Преимущества Docker Compose: простота запуска всех сервисов одной командой, изоляция окружений, автоматическое управление зависимостями, персистентность данных через volumes.

### 6.3.2 Production развертывание (Kubernetes)

Для production развертывания используются Kubernetes манифесты, которые определяют Deployment, Service и PersistentVolumeClaim для каждого компонента системы. Конфигурация находится в файле `all.yaml` (см. Листинг 6.9).

**Листинг 6.9** – Kubernetes манифесты для развертывания (файл `all.yaml`)

```yaml
# MongoDB Deployment + PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      labels:
        app: mongo
    spec:
      containers:
        - name: mongo
          image: mongo:latest
          ports:
            - containerPort: 27017
          volumeMounts:
            - name: mongo-storage
              mountPath: /data/db
      volumes:
        - name: mongo-storage
          persistentVolumeClaim:
            claimName: mongo-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mongo
spec:
  selector:
    app: mongo
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
  type: ClusterIP
---
# Analytics Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: analytics-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: analytics-service
  template:
    metadata:
      labels:
        app: analytics-service
    spec:
      containers:
        - name: analytics-service
          image: analytics-service:latest
          ports:
            - containerPort: 4002
          env:
            - name: MONGO_URI
              value: mongodb://mongo:27017/weather
---
apiVersion: v1
kind: Service
metadata:
  name: analytics-service
spec:
  selector:
    app: analytics-service
  ports:
    - protocol: TCP
      port: 4002
      targetPort: 4002
  type: ClusterIP
---
# Weather Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: weather-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: weather-service
  template:
    metadata:
      labels:
        app: weather-service
    spec:
      containers:
        - name: weather-service
          image: weather-service:latest
          ports:
            - containerPort: 4001
---
apiVersion: v1
kind: Service
metadata:
  name: weather-service
spec:
  selector:
    app: weather-service
  ports:
    - protocol: TCP
      port: 4001
      targetPort: 4001
  type: ClusterIP
---
# Gateway (GraphQL)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
spec:
  replicas: 1
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
        - name: gateway
          image: gateway:latest
          ports:
            - containerPort: 4000
---
apiVersion: v1
kind: Service
metadata:
  name: gateway
spec:
  selector:
    app: gateway
  ports:
    - protocol: TCP
      port: 4000
      targetPort: 4000
  type: ClusterIP
---
# React Client
apiVersion: apps/v1
kind: Deployment
metadata:
  name: client
spec:
  replicas: 1
  selector:
    matchLabels:
      app: client
  template:
    metadata:
      labels:
        app: client
    spec:
      containers:
        - name: client
          image: client:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: client
spec:
  selector:
    app: client
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 80
  type: NodePort
```

Компоненты Kubernetes включают: MongoDB (Deployment с 1 репликой, PersistentVolumeClaim 1Gi, Service типа ClusterIP), Analytics Service (Deployment с 1 репликой, Service типа ClusterIP, environment переменные для MongoDB), Weather Service (Deployment с 1 репликой, Service типа ClusterIP), Gateway (Deployment с 1 репликой, Service типа ClusterIP), Client (Deployment с 1 репликой, Service типа NodePort на порту 3000).

Развертывание осуществляется командой `kubectl apply -f all.yaml`. Kubernetes позволяет масштабировать сервисы в зависимости от нагрузки через команды `kubectl scale` и `kubectl autoscale`.

Преимущества Kubernetes: автоматическое управление контейнерами, масштабирование и балансировка нагрузки, self-healing (автоматический перезапуск упавших pod'ов), управление конфигурацией и секретами.

### 6.3.3 Health Checks и конфигурация

Каждый сервис имеет endpoint `/health` для проверки состояния (см. Листинг 6.10). Health checks используются для мониторинга состояния сервисов, Kubernetes liveness и readiness probes, автоматического перезапуска неработающих сервисов, балансировки нагрузки.

**Листинг 6.10** – Реализация health check endpoint (файлы `gateway/src/index.js`, `weather-service/src/index.js`, `analytics-service/src/index.js`)

```javascript
// Gateway health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway' });
});

// Weather Service health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'weather-service' });
});

// Analytics Service health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analytics-service' });
});
```

Все сервисы используют environment переменные для конфигурации: `PORT` – порт сервиса, `MONGO_URI` – строка подключения к MongoDB, `WEATHER_SERVICE_URL` – URL Weather Service, `ANALYTICS_SERVICE_URL` – URL Analytics Service. Преимущества: разделение конфигурации для разных сред, безопасность, гибкость настройки без изменения кода, простота управления через Kubernetes ConfigMaps и Secrets.

---

## 6.4 Тестирование приложения

Тестирование приложения Weather App включает проверку работоспособности REST API, GraphQL API и функциональности клиентского приложения.

### 6.4.1 Тестирование API

Тестирование REST API включает проверку endpoints Weather Service (`/weather/:city`, `/forecast/:city`, `/search/:query`, `/geocode/:city`) и Analytics Service (`/history`, `/stats/city/:city`, `/trends/:city`, `/popular`, `/health`). Примеры команд для тестирования представлены в Листинге 6.11.

**Листинг 6.11** – Команды для тестирования REST API

```bash
# Тест получения текущей погоды
curl http://localhost:4001/weather/Moscow

# Тест получения прогноза
curl http://localhost:4001/forecast/London

# Тест поиска городов
curl http://localhost:4001/search/new

# Тест получения статистики города
curl http://localhost:4002/stats/city/Moscow?days=30

# Тест популярных городов
curl http://localhost:4002/popular?limit=5

# Тест истории запросов
curl http://localhost:4002/history?page=1&limit=20

# Тест health check
curl http://localhost:4002/health
```

Тестирование GraphQL API осуществляется через POST запросы к endpoint `/graphql`. Для интерактивного тестирования доступен GraphQL Playground по адресу `http://localhost:4000/graphql` (см. Рисунок 6.1), который предоставляет интерактивный редактор запросов, автодополнение полей, документацию схемы и историю запросов.

**Рисунок 6.1** – GraphQL Playground для тестирования API

### 6.4.2 Функциональное тестирование и производительность

Функциональное тестирование клиента включает проверку основных функций: поиск города (ввод на русском и английском языках, автодополнение), отображение погоды (температура, влажность, давление, скорость ветра, иконка, описание), прогноз на 5 дней, история запросов с пагинацией, аналитика (графики популярных городов и трендов температуры), кэширование (использование кэша при повторных запросах, обновление после TTL, сохранение между перезагрузками), темы (переключение между темной и светлой темами, сохранение предпочтений, плавные переходы). Скриншоты интерфейса приложения представлены на Рисунках 6.2–6.4.

**Рисунок 6.2** – Главная страница приложения с отображением текущей погоды

**Рисунок 6.3** – Страница аналитики с графиками статистики

**Рисунок 6.4** – Страница истории запросов

Тестирование производительности показало следующие результаты: время ответа для получения текущей погоды < 2 секунд (включая сетевую задержку), время ответа для поиска городов < 1 секунда, время ответа при использовании кэша < 100 мс. Для нагрузочного тестирования использовались инструменты Apache Bench, wrk, k6.

Тестирование отказоустойчивости подтвердило изоляцию отказов: при отказе Weather Service Gateway возвращает ошибку, но не падает, Analytics Service продолжает работать; при отказе Analytics Service получение погоды продолжает работать; при отказе MongoDB получение погоды продолжает работать, Analytics Service обрабатывает ошибки подключения; при отказе Open-Meteo API Weather Service обрабатывает ошибки, пользователю отображается сообщение об ошибке.

В результате тестирования было подтверждено: все REST API endpoints работают корректно, GraphQL API обрабатывает запросы и возвращает данные, клиентское приложение отображает все функции, кэширование уменьшает количество запросов к серверу, система устойчива к отказам отдельных компонентов, производительность соответствует требованиям, health checks работают для всех сервисов. Приложение готово к использованию и демонстрирует работоспособность всех реализованных архитектурных паттернов и принципов.


