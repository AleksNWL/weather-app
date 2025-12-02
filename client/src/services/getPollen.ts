import axios from "axios";
import {CoordinatesTypes} from "../types/coordinatesTypes.ts";


export const getPollen = async (coordinates: CoordinatesTypes) => {
    const CACHE_TTL = 10 * 60 * 1000;

    const cacheKey = `pollen_${coordinates.latitude}_${coordinates.longitude}`;
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (now - timestamp < CACHE_TTL) return data;
    }

    const endpoint = "https://air-quality-api.open-meteo.com/v1/air-quality";
    const params = {
        hourly: "alder_pollen,birch_pollen,grass_pollen,mugwort_pollen",
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
    };

    try {
        const { data } = await axios.get(endpoint, { params });
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: data.hourly }));
        return data.hourly;
    } catch (error) {
        console.error(error);
        return null;
    }
};
