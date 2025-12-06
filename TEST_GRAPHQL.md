# 🧪 Тестирование GraphQL API

## Статус: ✅ GraphQL endpoint работает!

Базовый тест пройден:
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}'

# Ответ: {"data":{"__typename":"Query"}}
```

## Комплексное тестирование

Выполните следующие команды для тестирования всех функций:

### 1. Запрос погоды
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getWeather(city: \"Moscow\") { city temperature description humidity wind_speed coordinates { lat lon } } }"}'
```

### 2. Запрос прогноза
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getForecast(city: \"London\") { city country forecast { date avgTemp minTemp maxTemp description } } }"}'
```

### 3. Поиск городов
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { searchCities(query: \"Paris\") { name country lat lon } }"}'
```

### 4. Получение координат
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getCityCoordinates(city: \"Tokyo\") { lat lon } }"}'
```

### 5. История запросов
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getHistory(page: 1, limit: 5) { data { city temperature description date } pagination { total pages } } }"}'
```

### 6. Статистика города
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getCityStats(city: \"Berlin\", days: 7) { avgTemp maxTemp minTemp totalRequests } }"}'
```

### 7. Популярные города
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getPopularCities(limit: 5) { city country requests } }"}'
```

### 8. Тренды города
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getCityTrends(city: \"New York\", days: 7) { date avgTemp maxTemp minTemp } }"}'
```

### 9. Погода по координатам
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getWeatherByCoords(lat: 55.7558, lon: 37.6173) { city temperature description coordinates { lat lon } } }"}'
```

## Автоматическое тестирование

Если у вас установлен `jq` для форматирования JSON:

```bash
# Сделать скрипт исполняемым
chmod +x test-graphql-comprehensive.sh

# Запустить все тесты
./test-graphql-comprehensive.sh
```

## Тестирование через GraphQL Playground

Откройте в браузере: **http://localhost:4000/graphql**

Пример запроса для Playground:
```graphql
query {
  getWeather(city: "Moscow") {
    city
    temperature
    description
    humidity
    wind_speed
    coordinates {
      lat
      lon
    }
  }
}
```

## Ожидаемые результаты

### ✅ Успешный ответ:
```json
{
  "data": {
    "getWeather": {
      "city": "Moscow",
      "temperature": 15.5,
      "description": "Clear sky",
      "humidity": 65,
      "wind_speed": 3.2,
      "coordinates": {
        "lat": 55.7558,
        "lon": 37.6173
      }
    }
  }
}
```

### ❌ Ошибка (если город не найден):
```json
{
  "errors": [
    {
      "message": "Не удалось получить погоду для города InvalidCity: City not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["getWeather"]
    }
  ],
  "data": null
}
```

## Проверка работоспособности микросервисов

Перед тестированием GraphQL убедитесь, что все сервисы запущены:

```bash
# Analytics Service
curl http://localhost:4002/health
# Ожидается: {"status":"ok","service":"analytics-service"}

# Weather Service
curl http://localhost:4001/health
# Ожидается: {"status":"ok","service":"weather-service"}

# Gateway
curl http://localhost:4000/health
# Ожидается: {"status":"ok","service":"gateway"}
```

## Примечание о diagnose-endpoint

`npx diagnose-endpoint` может не работать с некоторыми GraphQL серверами из-за:
- Требования к специфическим заголовкам
- Особенностей Apollo Server конфигурации
- CORS настроек

**Но это не означает, что GraphQL не работает!** 

Если:
- ✅ `curl` запросы возвращают правильные ответы
- ✅ GraphQL Playground открывается и работает
- ✅ Health endpoints отвечают

То **GraphQL полностью работоспособен** ✅

