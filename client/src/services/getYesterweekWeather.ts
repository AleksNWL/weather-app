import axios from "axios";
import { CoordinatesTypes } from "../types/coordinatesTypes.ts";

export const getLastWeekWeatherAtSameTime = async (coordinates: CoordinatesTypes) => {
    if (!coordinates) return;

    const cacheKey = `lastWeekWeather_${coordinates.latitude}_${coordinates.longitude}`;
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();
    const CACHE_TTL = 10 * 60 * 1000;

    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (now - timestamp < CACHE_TTL) return data;
    }

    const date = new Date();
    date.setDate(date.getDate() - 7);
    const dateStr = date.toISOString().split("T")[0];
    const hour = new Date().getHours();

    const endpoint = 'https://archive-api.open-meteo.com/v1/archive';
    const params = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        start_date: dateStr,
        end_date: dateStr,
        hourly: "temperature_2m,apparent_temperature,weathercode,pressure_msl,relative_humidity_2m,windspeed",
        timezone: "auto"
    };

    try {
        const { data } = await axios.get(endpoint, { params });

        const index = data.hourly?.time?.findIndex((t: string) => new Date(t).getHours() === hour);
        if (index === -1 || !data.hourly) return null;

        const result = {
            temperature_2m: data.hourly.temperature_2m?.[index],
            apparent_temperature: data.hourly.apparent_temperature?.[index],
            weathercode: data.hourly.weathercode?.[index],
            pressure_msl: data.hourly.pressure_msl?.[index],
            relative_humidity_2m: data.hourly.relative_humidity_2m?.[index],
            windspeed: data.hourly.windspeed?.[index],
        };

        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: result }));
        return result;
    } catch (error) {
        console.error("Ошибка при получении архивных данных:", error);
        return null;
    }
};

