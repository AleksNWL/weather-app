import {useContext, useState, createContext, ReactNode} from "react";
import {PollenTypes} from "../types/pollenTypes.ts"
import {CoordinatesTypes} from "../types/coordinatesTypes.ts";
import {getPollen} from "../services/getPollen.ts";


interface PollenContextTypes {
    pollen: PollenTypes | null;
    setCoords: (coords: CoordinatesTypes) => void;
}

interface PollenProviderProps {
    children: ReactNode;
}

const PollenContext = createContext<PollenContextTypes | null>(null);

export const PollenContextProvider = ({children}: PollenProviderProps) => {
    const [pollen, setPollen] = useState<PollenTypes | null>(null);

    const setCoords = async (coords: CoordinatesTypes) => {
        const data = await getPollen(coords);
        if (data) {
            setPollen(data);
        }
    };

    return (
        <PollenContext.Provider value={{ pollen, setCoords }}>
            {children}
        </PollenContext.Provider>
    )
}

export const usePollen = () => {
    const context = useContext(PollenContext);
    if (!context) throw new Error("usePollen must be used within a PollenContextProvider");
    return context;
}