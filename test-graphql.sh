#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 Тестирование GraphQL API...${NC}"
echo ""

GATEWAY_URL="http://localhost:4000/graphql"

# Проверка доступности
echo -e "${BLUE}1. Проверка доступности GraphQL endpoint...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST $GATEWAY_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}')

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ GraphQL endpoint доступен${NC}"
else
    echo -e "${RED}❌ GraphQL endpoint недоступен (HTTP $response)${NC}"
    echo -e "${RED}   Убедитесь, что gateway запущен на порту 4000${NC}"
    exit 1
fi

echo ""

# Тест 1: Простой запрос
echo -e "${BLUE}2. Тест: Простой запрос (__typename)...${NC}"
curl -X POST $GATEWAY_URL \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __typename }"}' \
  | jq '.' 2>/dev/null || echo "Ответ получен (jq не установлен для форматирования)"
echo ""

# Тест 2: Запрос погоды
echo -e "${BLUE}3. Тест: Запрос погоды для Moscow...${NC}"
curl -X POST $GATEWAY_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getWeather(city: \"Moscow\") { city temperature description coordinates { lat lon } } }"
  }' \
  | jq '.' 2>/dev/null || echo "Ответ получен"
echo ""

# Тест 3: Запрос истории
echo -e "${BLUE}4. Тест: Запрос истории...${NC}"
curl -X POST $GATEWAY_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getHistory(page: 1, limit: 5) { data { city temperature date } pagination { total pages } } }"
  }' \
  | jq '.' 2>/dev/null || echo "Ответ получен"
echo ""

# Тест 4: Запрос статистики
echo -e "${BLUE}5. Тест: Запрос статистики города...${NC}"
curl -X POST $GATEWAY_URL \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getCityStats(city: \"London\", days: 7) { avgTemp maxTemp minTemp totalRequests } }"
  }' \
  | jq '.' 2>/dev/null || echo "Ответ получен"
echo ""

echo -e "${GREEN}✅ Тестирование завершено${NC}"
echo -e "${BLUE}📊 Откройте GraphQL Playground: http://localhost:4000/graphql${NC}"

