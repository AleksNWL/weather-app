import axios from "axios";
import { CoordinatesTypes } from "../types/coordinatesTypes.ts";

export const getAirData = async (coordinates: CoordinatesTypes) => {
    const CACHE_TTL = 10 * 60 * 1000;

    const cacheKey = `airData_${coordinates.latitude}_${coordinates.longitude}`;
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (now - timestamp < CACHE_TTL) return data;
    }

    const endpoint = "https://air-quality-api.open-meteo.com/v1/air-quality";
    const params = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        current: "us_aqi,uv_index",
    };

    try {
        const { data } = await axios.get(endpoint, { params });
        const result = {
            aqi: data.current?.us_aqi ?? null,
            uv: Math.round(data.current?.uv_index) ?? null,
        };

        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: result }));
        return result;
    } catch (error) {
        console.error("Ошибка при получении данных воздуха:", error);
        return { aqi: null, uv: null };
    }
};
