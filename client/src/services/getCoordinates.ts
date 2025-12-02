import axios from 'axios';


export const getCoordinates = async (city: string) => {
    if (!city.trim()) {
        return;
    }

    const endpoint = 'https://geocoding-api.open-meteo.com/v1/search';
    const params = {
        name: city,
        count: 1,
        language: 'ru',
        format: 'json',
    };

    try {
        const { data } = await axios.get(endpoint, { params });

        if (data?.results?.length > 0) {
            return data.results[0];
        } else {
            return null;
        }
    }
    catch (error) {
        console.error(error);
        return null;
    }
}