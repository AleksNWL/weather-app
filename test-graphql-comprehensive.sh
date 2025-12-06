#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

GATEWAY_URL="http://localhost:4000/graphql"

echo -e "${BLUE}🧪 Комплексное тестирование GraphQL API${NC}"
echo "=========================================="
echo ""

# Функция для выполнения запроса
test_query() {
    local name=$1
    local query=$2
    
    echo -e "${BLUE}📋 Тест: $name${NC}"
    echo -e "${YELLOW}Запрос:${NC}"
    echo "$query" | jq -R '.' 2>/dev/null || echo "$query"
    echo ""
    
    response=$(curl -s -X POST $GATEWAY_URL \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(echo "$query" | jq -Rs .)}")
    
    if echo "$response" | jq -e '.errors' > /dev/null 2>&1; then
        echo -e "${RED}❌ Ошибка:${NC}"
        echo "$response" | jq '.errors' 2>/dev/null || echo "$response"
    else
        echo -e "${GREEN}✅ Успешно:${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    fi
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Тест 1: Простой запрос
test_query "Простой запрос (__typename)" \
"query { __typename }"

# Тест 2: Запрос погоды
test_query "Запрос погоды для Moscow" \
"query {
  getWeather(city: \"Moscow\") {
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
}"

# Тест 3: Запрос прогноза
test_query "Запрос прогноза для London" \
"query {
  getForecast(city: \"London\") {
    city
    country
    forecast {
      date
      avgTemp
      minTemp
      maxTemp
      description
    }
  }
}"

# Тест 4: Поиск городов
test_query "Поиск городов (Paris)" \
"query {
  searchCities(query: \"Paris\") {
    name
    country
    lat
    lon
  }
}"

# Тест 5: Получение координат города
test_query "Получение координат для Tokyo" \
"query {
  getCityCoordinates(city: \"Tokyo\") {
    lat
    lon
  }
}"

# Тест 6: Запрос истории
test_query "Запрос истории запросов" \
"query {
  getHistory(page: 1, limit: 5) {
    data {
      city
      temperature
      description
      date
    }
    pagination {
      total
      pages
      page
      limit
    }
  }
}"

# Тест 7: Статистика города
test_query "Статистика для Berlin" \
"query {
  getCityStats(city: \"Berlin\", days: 7) {
    avgTemp
    maxTemp
    minTemp
    avgHumidity
    totalRequests
    mostCommonDescription
  }
}"

# Тест 8: Популярные города
test_query "Популярные города" \
"query {
  getPopularCities(limit: 5) {
    city
    country
    requests
  }
}"

# Тест 9: Тренды города
test_query "Тренды для New York" \
"query {
  getCityTrends(city: \"New York\", days: 7) {
    date
    avgTemp
    maxTemp
    minTemp
  }
}"

# Тест 10: Запрос погоды по координатам
test_query "Погода по координатам (55.7558, 37.6173 - Москва)" \
"query {
  getWeatherByCoords(lat: 55.7558, lon: 37.6173) {
    city
    temperature
    description
    coordinates {
      lat
      lon
    }
  }
}"

echo -e "${GREEN}✅ Все тесты завершены!${NC}"
echo ""
echo -e "${BLUE}📊 GraphQL Playground: http://localhost:4000/graphql${NC}"

