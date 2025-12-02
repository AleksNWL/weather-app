import axios from "axios";
import {CoordinatesTypes} from "../types/coordinatesTypes.ts";


export const getWeather = async (coordinates: CoordinatesTypes) => {
    if (!coordinates) return;

    const CACHE_TTL = 10 * 60 * 1000;

    const cacheKey = `weather_${coordinates.latitude}_${coordinates.longitude}`;
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (now - timestamp < CACHE_TTL) return data;
    }

    const endpoint = 'https://api.open-meteo.com/v1/forecast';
    const params = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        current_weather: true,
        hourly: "temperature_2m,apparent_temperature,precipitation,precipitation_probability,weathercode,windgusts_10m,visibility,pressure_msl,relative_humidity_2m",
        timezone: "auto",
        forecast_days: 10
    };

    try {
        const { data } = await axios.get(endpoint, { params });
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data }));
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
};
