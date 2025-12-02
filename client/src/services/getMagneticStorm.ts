import axios from "axios";

export type KPDataPoint = {
    time_tag: string;
    kp_index: number;
    source: string;
};

export async function getMagneticStorm(): Promise<KPDataPoint[] | null> {
    const CACHE_TTL = 10 * 60 * 1000;

    const cacheKey = "magneticStorm";
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (now - timestamp < CACHE_TTL) return data;
    }

    try {
        const res = await axios.get<KPDataPoint[]>(
            "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json"
        );
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: res.data }));
        return res.data;
    } catch (error) {
        console.error("Ошибка при загрузке K-index:", error);
        return null;
    }
}
