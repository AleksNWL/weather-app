import {createContext, ReactNode, useContext, useState} from "react";
import {CoordinatesTypes} from "../types/coordinatesTypes.ts";
import {getWeather} from "../services/getWeather.ts";
import {WeatherData} from "../types/weatherTypes.ts";


interface WeatherContextType {
    weather: WeatherData | null;
    setCoordinates: (coords: CoordinatesTypes) => void;
}

interface WeatherProviderProps {
    children: ReactNode;
}

const WeatherContext = createContext<WeatherContextType | null>(null);

export const WeatherProvider = ({ children }: WeatherProviderProps) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);

    const setCoordinates = async (coords: CoordinatesTypes) => {
        const data = await getWeather(coords);
        if (data) {
            setWeather(data);
        }
    };

    return (
        <WeatherContext.Provider value={{ weather, setCoordinates }}>
            {children}
        </WeatherContext.Provider>
    )
}

export const useWeather = () => {
    const context = useContext(WeatherContext);
    if (!context) throw new Error("useWeather must be used within WeatherProvider");
    return context;
}