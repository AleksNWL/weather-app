#!/bin/bash

# Test script for Open-Meteo migration
echo "🌤️  Testing Open-Meteo Integration"
echo "===================================="
echo ""

# Check if services are running
WEATHER_SERVICE="http://localhost:4001"
GATEWAY="http://localhost:4000/graphql"

echo "1. Testing Weather Service (Direct API)"
echo "----------------------------------------"

# Test weather endpoint
echo "Testing: GET /weather/London"
curl -s "${WEATHER_SERVICE}/weather/London" | head -c 200
echo -e "\n"

# Test forecast endpoint
echo "Testing: GET /forecast/Tokyo"
curl -s "${WEATHER_SERVICE}/forecast/Tokyo" | head -c 200
echo -e "\n"

# Test search endpoint
echo "Testing: GET /search/Paris"
curl -s "${WEATHER_SERVICE}/search/Paris" | head -c 200
echo -e "\n"

echo "2. Testing with Russian Cities"
echo "------------------------------"

# Test with Russian city (transliteration test)
echo "Testing: GET /weather/Москва"
curl -s "${WEATHER_SERVICE}/weather/Москва" | head -c 200
echo -e "\n"

echo "3. Testing Weather Coordinates"
echo "------------------------------"

# Test coordinates endpoint (Berlin: 52.52°N, 13.40°E)
echo "Testing: GET /weather/coordinates/52.52/13.40"
curl -s "${WEATHER_SERVICE}/weather/coordinates/52.52/13.40" | head -c 200
echo -e "\n"

echo "4. Testing GraphQL Gateway"
echo "--------------------------"

# Test GraphQL getWeather query
echo "Testing: GraphQL getWeather query"
curl -s -X POST "${GATEWAY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getWeather(city: \"London\") { city temperature humidity description } }"
  }' | head -c 200
echo -e "\n"

# Test GraphQL getWeatherRU query
echo "Testing: GraphQL getWeatherRU query (Russian input)"
curl -s -X POST "${GATEWAY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getWeatherRU(city: \"Москва\") { city temperature humidity description } }"
  }' | head -c 200
echo -e "\n"

echo "✅ Test Suite Complete!"
echo ""
echo "Next steps:"
echo "1. Check if all responses contain weather data"
echo "2. Verify temperatures are in Celsius"
echo "3. Verify Russian city names are correctly transliterated"
echo "4. Verify icons are returned in correct format"
