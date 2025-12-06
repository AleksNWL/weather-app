# Локальный запуск без Docker (macOS)

## Предварительные требования

1. **Node.js** (версия 18 или выше)
2. **MongoDB** (для analytics-service)
   - Установка через Homebrew: `brew install mongodb-community`
   - Или скачать с [официального сайта](https://www.mongodb.com/try/download/community)

## Шаг 1: Установка зависимостей

```bash
# Установить зависимости для всех сервисов
cd gateway && npm install && cd ..
cd weather-service && npm install && cd ..
cd analytics-service && npm install && cd ..
cd client && npm install && cd ..
```

## Шаг 2: Запуск MongoDB

```bash
# Запустить MongoDB (если установлен через Homebrew)
brew services start mongodb-community

# Или запустить вручную
mongod --dbpath ~/data/db
```

## Шаг 3: Запуск сервисов

Откройте **4 отдельных терминала** и выполните команды:

### Терминал 1: Analytics Service (порт 4002)
```bash
cd analytics-service
export MONGO_URI=mongodb://localhost:27017/weather
export PORT=4002
npm start
```

### Терминал 2: Weather Service (порт 4001)
```bash
cd weather-service
export PORT=4001
export ANALYTICS_SERVICE_URL=http://localhost:4002
npm start
```

### Терминал 3: Gateway (GraphQL) (порт 4000)
```bash
cd gateway
export PORT=4000
export WEATHER_SERVICE_URL=http://localhost:4001
export ANALYTICS_SERVICE_URL=http://localhost:4002
npm start
```

### Терминал 4: Client (опционально, порт 3000)
```bash
cd client
npm start
```

## Шаг 4: Проверка работоспособности

### Проверка health endpoints:

```bash
# Analytics Service
curl http://localhost:4002/health

# Weather Service
curl http://localhost:4001/health

# Gateway
curl http://localhost:4000/health
```

### Тестирование GraphQL:

```bash
# Простой запрос
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}'

# Запрос погоды
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getWeather(city: \"Moscow\") { city temperature description } }"
  }'
```

### Открыть GraphQL Playground:

Откройте в браузере: **http://localhost:4000/graphql**

## Автоматический запуск (скрипт)

Создайте файл `start-local.sh` в корне проекта:

```bash
#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Запуск всех сервисов локально...${NC}"

# Проверка MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}⚠️  MongoDB не запущен. Запустите: brew services start mongodb-community${NC}"
fi

# Функция для запуска сервиса в фоне
start_service() {
    local service=$1
    local port=$2
    local env_vars=$3
    
    echo -e "${BLUE}📦 Запуск $service на порту $port...${NC}"
    cd $service
    eval $env_vars npm start > ../logs/$service.log 2>&1 &
    cd ..
    echo -e "${GREEN}✅ $service запущен (PID: $!)${NC}"
}

# Создать папку для логов
mkdir -p logs

# Запуск сервисов
start_service "analytics-service" "4002" "MONGO_URI=mongodb://localhost:27017/weather PORT=4002"
sleep 2

start_service "weather-service" "4001" "PORT=4001 ANALYTICS_SERVICE_URL=http://localhost:4002"
sleep 2

start_service "gateway" "4000" "PORT=4000 WEATHER_SERVICE_URL=http://localhost:4001 ANALYTICS_SERVICE_URL=http://localhost:4002"
sleep 2

echo -e "${GREEN}✅ Все сервисы запущены!${NC}"
echo -e "${BLUE}📊 GraphQL Playground: http://localhost:4000/graphql${NC}"
echo -e "${BLUE}📝 Логи находятся в папке logs/${NC}"
echo -e "${BLUE}🛑 Для остановки: pkill -f 'node.*src/index.js'${NC}"
```

Сделайте скрипт исполняемым:
```bash
chmod +x start-local.sh
./start-local.sh
```

## Остановка сервисов

```bash
# Остановить все Node.js процессы
pkill -f 'node.*src/index.js'

# Или остановить по портам
lsof -ti:4000 | xargs kill
lsof -ti:4001 | xargs kill
lsof -ti:4002 | xargs kill
```

## Troubleshooting

### Проблема: "Port already in use"
```bash
# Найти процесс, использующий порт
lsof -i :4000

# Убить процесс
kill -9 <PID>
```

### Проблема: "Cannot connect to MongoDB"
```bash
# Проверить, запущен ли MongoDB
pgrep mongod

# Если нет, запустить
brew services start mongodb-community
```

### Проблема: "Module not found"
```bash
# Переустановить зависимости
cd gateway && rm -rf node_modules && npm install && cd ..
cd weather-service && rm -rf node_modules && npm install && cd ..
cd analytics-service && rm -rf node_modules && npm install && cd ..
```

## Альтернатива: Использование npm-run-all

Установите `npm-run-all` глобально:
```bash
npm install -g npm-run-all
```

Создайте `package.json` в корне проекта:
```json
{
  "scripts": {
    "start:analytics": "cd analytics-service && MONGO_URI=mongodb://localhost:27017/weather PORT=4002 npm start",
    "start:weather": "cd weather-service && PORT=4001 ANALYTICS_SERVICE_URL=http://localhost:4002 npm start",
    "start:gateway": "cd gateway && PORT=4000 WEATHER_SERVICE_URL=http://localhost:4001 ANALYTICS_SERVICE_URL=http://localhost:4002 npm start",
    "start:all": "npm-run-all --parallel start:analytics start:weather start:gateway"
  }
}
```

Запуск всех сервисов:
```bash
npm run start:all
```

