import { useEffect, useState } from "react";
import styles from "./FavoritesList.module.scss";
import { useCoordsCity } from "../../context/CoordsCityContext.tsx";
import { useWeather } from "../../context/WeatherContext.tsx";
import { usePollen } from "../../context/PollenContext.tsx";
import { getCity } from "../../services/getCity.ts";
import { CoordinatesTypes } from "../../types/coordinatesTypes.ts";

type LocationType = {
    name: string;
    coords: {
        lat: number;
        lon: number;
    };
};

export default function FavoritesList() {
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [checked, setChecked] = useState<boolean>(false);

    const { setCity, setCoordinate } = useCoordsCity();
    const { setCoordinates } = useWeather();
    const { setCoords } = usePollen();

    const loadLocations = () => {
        const saved = localStorage.getItem("likedLocations");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setLocations(parsed);
                }
            } catch (e) {
                console.error("Ошибка чтения likedLocations:", e);
            }
        } else {
            setLocations([]);
        }
    };

    useEffect(() => {
        loadLocations();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "likedLocations") {
                loadLocations();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        const intervalId = setInterval(() => {
            loadLocations();
        }, 1000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(intervalId);
        };
    }, []);

    const handleSelect = async (loc: LocationType) => {
        const coords: CoordinatesTypes = {
            latitude: loc.coords.lat,
            longitude: loc.coords.lon,
        };

        const detectedCity = await getCity(coords);
        if (detectedCity) {
            setCity(detectedCity);
        }

        setCoordinate(coords);
        setCoordinates(coords);
        setCoords(coords);
    };

    return (
        <>
            {checked
                ? <div className={styles.container}>
                    <div className={styles.containerButton} onClick={() => setChecked(!checked)} style={{borderBottomRightRadius: 0, borderBottomLeftRadius: 0}}>
                        <svg width="18" height="24" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon}>
                            <path d="M14.1923 0H3.80771C2.79785 0 1.82935 0.397219 1.11528 1.10428C0.401192 1.81133 2.79641e-05 2.77031 2.79641e-05 3.77024V22.9642C-0.00137049 23.153 0.0497076 23.3384 0.147669 23.5003C0.245644 23.6622 0.386709 23.7942 0.555438 23.8821C0.724167 23.9698 0.914052 24.0099 1.10427 23.9979C1.29449 23.986 1.47771 23.9224 1.63387 23.8142L9.00002 18.7278L16.3662 23.8142C16.5416 23.9325 16.7493 23.9946 16.9615 23.9925C17.1291 23.9905 17.2943 23.9531 17.4462 23.8828C17.6127 23.7924 17.7519 23.6596 17.8492 23.4981C17.9467 23.3366 17.9986 23.1523 18 22.9642V3.77024C18 2.77031 17.5989 1.81133 16.8847 1.10428C16.1706 0.397219 15.2021 0 14.1923 0Z" fill="white"/>
                        </svg>
                        <span className={styles.heading}>Избранное</span>
                    </div>
                    <div className={styles.favoritesList}>
                        {locations.length === 0 ? (
                            <p className={styles.empty}>Пусто</p>
                        ) : (
                            <ul>
                                {locations.map((loc, idx) => (
                                    <li
                                        key={idx}
                                        className={styles.item}
                                        onClick={() => handleSelect(loc)}
                                        tabIndex={0}
                                        role="button"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") handleSelect(loc);
                                        }}
                                    >
                                        <p>{loc.name}</p>
                                        {idx !== locations.length - 1 && <div className={styles.stick}></div>}
                                    </li>
                                ))}
                            </ul>

                        )}
                    </div>
                </div>
                :
                <div className={styles.containerButton} onClick={() => setChecked(!checked)}>
                    <svg width="18" height="24" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.1923 0H3.80771C2.79785 0 1.82935 0.397219 1.11528 1.10428C0.401192 1.81133 2.79641e-05 2.77031 2.79641e-05 3.77024V22.9642C-0.00137049 23.153 0.0497076 23.3384 0.147669 23.5003C0.245644 23.6622 0.386709 23.7942 0.555438 23.8821C0.724167 23.9698 0.914052 24.0099 1.10427 23.9979C1.29449 23.986 1.47771 23.9224 1.63387 23.8142L9.00002 18.7278L16.3662 23.8142C16.5416 23.9325 16.7493 23.9946 16.9615 23.9925C17.1291 23.9905 17.2943 23.9531 17.4462 23.8828C17.6127 23.7924 17.7519 23.6596 17.8492 23.4981C17.9467 23.3366 17.9986 23.1523 18 22.9642V3.77024C18 2.77031 17.5989 1.81133 16.8847 1.10428C16.1706 0.397219 15.2021 0 14.1923 0Z" fill="white"/>
                    </svg>
                    <span className={styles.heading}>Избранное</span>
                </div>
            }
        </>
    );
}
