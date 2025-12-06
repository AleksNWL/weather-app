# 🚀 Быстрый запуск GraphQL на macOS

## Проблема
`npx diagnose-endpoint` не может подключиться к `http://localhost:4000/graphql`, потому что сервисы не запущены.

## Решение: Запуск локально

### Вариант 1: Автоматический запуск (рекомендуется)

1. **Установите зависимости** (если еще не установлены):
```bash
cd gateway && npm install && cd ..
cd weather-service && npm install && cd ..
cd analytics-service && npm install && cd ..
```

2. **Запустите MongoDB**:
```bash
brew services start mongodb-community
```

3. **Запустите все сервисы одной командой**:
```bash
chmod +x start-local.sh
./start-local.sh
```

4. **Проверьте работоспособность**:
```bash
# Health check
curl http://localhost:4000/health

# GraphQL запрос
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}'
```

5. **Откройте GraphQL Playground**:
```
http://localhost:4000/graphql
```

### Вариант 2: Ручной запуск (3 терминала)

**Терминал 1 - Analytics Service:**
```bash
cd analytics-service
export MONGO_URI=mongodb://localhost:27017/weather
export PORT=4002
npm start
```

**Терминал 2 - Weather Service:**
```bash
cd weather-service
export PORT=4001
export ANALYTICS_SERVICE_URL=http://localhost:4002
npm start
```

**Терминал 3 - Gateway (GraphQL):**
```bash
cd gateway
export PORT=4000
export WEATHER_SERVICE_URL=http://localhost:4001
export ANALYTICS_SERVICE_URL=http://localhost:4002
npm start
```

## Тестирование GraphQL

### Через curl:
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getWeather(city: \"Moscow\") { city temperature description } }"
  }'
```

### Через GraphQL Playground:
1. Откройте браузер: `http://localhost:4000/graphql`
2. Введите запрос:
```graphql
query {
  getWeather(city: "Moscow") {
    city
    temperature
    description
    coordinates {
      lat
      lon
    }
  }
}
```

### Через скрипт:
```bash
chmod +x test-graphql.sh
./test-graphql.sh
```

## Остановка сервисов

```bash
# Автоматически
./stop-local.sh

# Или вручную
pkill -f 'node.*src/index.js'
```

## Troubleshooting

### MongoDB не запущен:
```bash
brew services start mongodb-community
# Или
mongod --dbpath ~/data/db
```

### Порт занят:
```bash
# Найти процесс
lsof -i :4000

# Остановить
kill -9 <PID>
```

### Модули не найдены:
```bash
cd gateway && rm -rf node_modules && npm install && cd ..
cd weather-service && rm -rf node_modules && npm install && cd ..
cd analytics-service && rm -rf node_modules && npm install && cd ..
```

## Проверка работоспособности

После запуска всех сервисов проверьте:

1. **Health endpoints:**
```bash
curl http://localhost:4002/health  # Analytics
curl http://localhost:4001/health  # Weather
curl http://localhost:4000/health  # Gateway
```

2. **GraphQL endpoint:**
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}'
```

Должен вернуться: `{"data":{"__typename":"Query"}}`

3. **GraphQL Playground:**
Откройте `http://localhost:4000/graphql` в браузере - должен открыться интерактивный редактор.

---

**Подробная инструкция:** см. `LOCAL_SETUP.md`  
**Анализ GraphQL:** см. `GRAPHQL_ANALYSIS.md`

