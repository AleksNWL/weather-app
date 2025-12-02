import axios from "axios";

const API_KEY = import.meta.env.VITE_NINJAS_KEY;

export default async function getHoroscope(zodiac: string) {
    try {
        const response = await axios.get(`https://api.api-ninjas.com/v1/horoscope`, {
            params: { zodiac },
            headers: { "X-Api-Key": API_KEY },
        });
        return response.data.horoscope;
    } catch (error) {
        console.error("Ошибка при получении гороскопа:", error);
        return null;
    }
}
