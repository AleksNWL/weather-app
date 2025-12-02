export const getMoonPhases = async () => {
    const CACHE_TTL = 10 * 60 * 1000;

    const cacheKey = `moonPhase`;
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (now - timestamp < CACHE_TTL) return data;
    }

    try {
        const nowUnix = Math.floor(Date.now() / 1000);
        const res = await fetch(`https://api.farmsense.net/v1/moonphases/?d=${nowUnix}`);
        const data = await res.json();

        if (data && data.length > 0) {
            const result = { phase: data[0].Phase };
            localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data: result }));
            return result;
        }

        return null;
    } catch (error) {
        console.error("Ошибка при получении фазы Луны:", error);
        return null;
    }
};
