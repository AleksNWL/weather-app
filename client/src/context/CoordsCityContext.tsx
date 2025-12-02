import { createContext, useContext, useState, ReactNode } from "react";

type CoordinatesTypes = {
    latitude: number;
    longitude: number;
};

type CoordsCityContextType = {
    coordinate: CoordinatesTypes | null;
    setCoordinate: (coords: CoordinatesTypes) => void;
    city: string;
    setCity: (city: string) => void;
};

const CoordsCityContext = createContext<CoordsCityContextType | undefined>(undefined);

export const CoordsCityProvider = ({ children }: { children: ReactNode }) => {
    const [coordinate, setCoordinate] = useState<CoordinatesTypes | null>(null);
    const [city, setCity] = useState<string>("");

    return (
        <CoordsCityContext.Provider value={{ coordinate, setCoordinate, city, setCity }}>
            {children}
        </CoordsCityContext.Provider>
    );
};

export const useCoordsCity = () => {
    const context = useContext(CoordsCityContext);
    if (!context) throw new Error("useCoordsCity must be used within CoordsCityProvider");
    return context;
};
