#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Запуск всех сервисов локально...${NC}"
echo ""

# Проверка MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB не запущен.${NC}"
    echo -e "${YELLOW}   Запустите: brew services start mongodb-community${NC}"
    echo -e "${YELLOW}   Или: mongod --dbpath ~/data/db${NC}"
    echo ""
    read -p "Продолжить без MongoDB? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Создать папку для логов
mkdir -p logs

# Функция для запуска сервиса в фоне
start_service() {
    local service=$1
    local port=$2
    local env_vars=$3
    
    echo -e "${BLUE}📦 Запуск $service на порту $port...${NC}"
    cd $service
    
    # Проверка наличия node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Установка зависимостей для $service...${NC}"
        npm install
    fi
    
    eval $env_vars npm start > ../logs/$service.log 2>&1 &
    local pid=$!
    cd ..
    
    # Проверка, запустился ли процесс
    sleep 1
    if ps -p $pid > /dev/null; then
        echo -e "${GREEN}✅ $service запущен (PID: $pid)${NC}"
    else
        echo -e "${RED}❌ Ошибка запуска $service. Проверьте logs/$service.log${NC}"
    fi
}

# Запуск сервисов
start_service "analytics-service" "4002" "MONGO_URI=mongodb://localhost:27017/weather PORT=4002"
sleep 3

start_service "weather-service" "4001" "PORT=4001 ANALYTICS_SERVICE_URL=http://localhost:4002"
sleep 3

start_service "gateway" "4000" "PORT=4000 WEATHER_SERVICE_URL=http://localhost:4001 ANALYTICS_SERVICE_URL=http://localhost:4002"
sleep 3

echo ""
echo -e "${GREEN}✅ Все сервисы запущены!${NC}"
echo ""
echo -e "${BLUE}📊 GraphQL Playground: http://localhost:4000/graphql${NC}"
echo -e "${BLUE}🌤️  Weather Service: http://localhost:4001${NC}"
echo -e "${BLUE}📈 Analytics Service: http://localhost:4002${NC}"
echo ""
echo -e "${BLUE}📝 Логи находятся в папке logs/${NC}"
echo -e "${YELLOW}🛑 Для остановки: ./stop-local.sh${NC}"
echo -e "${YELLOW}   Или: pkill -f 'node.*src/index.js'${NC}"

