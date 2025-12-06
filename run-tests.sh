#!/bin/bash

# Простой скрипт для тестирования GraphQL на macOS

GATEWAY_URL="http://localhost:4000/graphql"

echo "🧪 Тестирование GraphQL API"
echo "=========================="
echo ""

# Тест 1: Простой запрос
echo "1️⃣  Тест: Простой запрос"
curl -s -X POST $GATEWAY_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}' | jq '.' 2>/dev/null || curl -s -X POST $GATEWAY_URL -H "Content-Type: application/json" -d '{"query": "query { __typename }"}'
echo ""
echo "---"
echo ""

# Тест 2: Запрос погоды
echo "2️⃣  Тест: Запрос погоды для Moscow"
curl -s -X POST $GATEWAY_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getWeather(city: \"Moscow\") { city temperature description humidity coordinates { lat lon } } }"}' | jq '.' 2>/dev/null || curl -s -X POST $GATEWAY_URL -H "Content-Type: application/json" -d '{"query": "query { getWeather(city: \"Moscow\") { city temperature description humidity coordinates { lat lon } } }"}'
echo ""
echo "---"
echo ""

# Тест 3: Запрос прогноза
echo "3️⃣  Тест: Запрос прогноза для London"
curl -s -X POST $GATEWAY_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getForecast(city: \"London\") { city country forecast { date avgTemp description } } }"}' | jq '.' 2>/dev/null || curl -s -X POST $GATEWAY_URL -H "Content-Type: application/json" -d '{"query": "query { getForecast(city: \"London\") { city country forecast { date avgTemp description } } }"}'
echo ""
echo "---"
echo ""

# Тест 4: История
echo "4️⃣  Тест: История запросов"
curl -s -X POST $GATEWAY_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getHistory(page: 1, limit: 3) { data { city temperature date } pagination { total } } }"}' | jq '.' 2>/dev/null || curl -s -X POST $GATEWAY_URL -H "Content-Type: application/json" -d '{"query": "query { getHistory(page: 1, limit: 3) { data { city temperature date } pagination { total } } }"}'
echo ""
echo "---"
echo ""

# Тест 5: Статистика
echo "5️⃣  Тест: Статистика для Berlin"
curl -s -X POST $GATEWAY_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getCityStats(city: \"Berlin\", days: 7) { avgTemp totalRequests } }"}' | jq '.' 2>/dev/null || curl -s -X POST $GATEWAY_URL -H "Content-Type: application/json" -d '{"query": "query { getCityStats(city: \"Berlin\", days: 7) { avgTemp totalRequests } }"}'
echo ""
echo "---"
echo ""

echo "✅ Тестирование завершено!"
echo ""
echo "📊 GraphQL Playground: http://localhost:4000/graphql"

