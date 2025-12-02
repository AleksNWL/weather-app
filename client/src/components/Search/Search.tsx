import { getCoordinates } from "../../services/getCoordinates.ts";
import { useState, useEffect } from "react";
import { useWeather } from "../../context/WeatherContext.tsx";
import { usePollen } from "../../context/PollenContext.tsx";
import { useCoordsCity } from "../../context/CoordsCityContext.tsx";
import styles from "./Search.module.scss";
import search from "/tools/search.svg";
import { helpSearch } from "../../services/helpSearch.ts";
import { HelpSearchType } from "../../types/helpSearch.ts";
import { getCity } from "../../services/getCity.ts";

export default function Search() {
    const { city: globalCity, setCity: setGlobalCity, setCoordinate } = useCoordsCity();
    const { setCoordinates } = useWeather();
    const { setCoords } = usePollen();

    const [placeHolderCity, setPlaceHolderCity] = useState(globalCity || "Введите город...");
    const [city, setLocalCity] = useState<string>("");
    const [suggestions, setSuggestions] = useState<Array<HelpSearchType>>([]);

    useEffect(() => {
        if (globalCity) {
            setPlaceHolderCity(globalCity);
            setLocalCity("");
        }
    }, [globalCity]);

    const postCity = async () => {
        const coords = await getCoordinates(city);
        if (coords) {
            const detectedCity = await getCity(coords);
            if (!detectedCity) return;

            setCoordinates(coords);
            setCoordinate(coords);
            setCoords(coords);

            setPlaceHolderCity(detectedCity);
            setLocalCity("");
            setGlobalCity(detectedCity);
        }
    };

    const keyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            postCity().catch(console.error);
        }
    };

    const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalCity(value);

        if (value.length >= 3) {
            try {
                const result = await helpSearch(value);
                setSuggestions(result);
            } catch (err) {
                console.error(err);
            }
        } else {
            setSuggestions([]);
        }
    };

    const onClickSuggestion = async (lat: number, lon: number, formatted: string) => {
        const coords = { latitude: lat, longitude: lon };
        const detectedCity = await getCity(coords);
        if (!detectedCity) return;

        setCoordinates(coords);
        setCoordinate(coords);
        setCoords(coords);

        setPlaceHolderCity(formatted);
        setLocalCity(formatted);
        setGlobalCity(detectedCity);
        setSuggestions([]);
    };

    return (
        <div className={styles.searchContainer}>
            <div onKeyDown={keyDownHandler} className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder={placeHolderCity}
                    onChange={onChange}
                    value={city}
                    className={`${styles.searchInput} ${styles[suggestions.length > 0 ? "helperOn" : ""]}`}
                />
                <img onClick={postCity} src={search} alt="Поиск" className={styles.icon} />
            </div>
            {suggestions.length > 0 && (
                <div className={styles.searchSuggestions}>
                    {suggestions.map((item, index) => (
                        <div
                            key={index}
                            className={styles.searchSuggestion}
                            onClick={() => onClickSuggestion(item.lat, item.lon, item.formatted)}
                        >
                            {item.formatted}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
