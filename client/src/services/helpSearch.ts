import axios from "axios";
import {HelpSearchType} from "../types/helpSearch.ts";


export const helpSearch = async (search: string) => {
    if (search.length < 3) return;

    const HELPSEARCH_API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

    const endpoint = "https://api.geoapify.com/v1/geocode/autocomplete";
    const params = {
        text: search,
        apiKey: HELPSEARCH_API_KEY,
        lang: "ru"
    }

    try {
        const { data } = await axios.get(endpoint, { params });
        console.log(data.features);
        return data.features.map((item: {properties: HelpSearchType}) => ({
            lat: item.properties.lat,
            lon: item.properties.lon,
            country: item.properties.country,
            city: item.properties.city,
            street: item.properties.street,
            formatted: item.properties.formatted,
        }))
    }
    catch (error) {
        console.log(error)
        return [];
    }
}