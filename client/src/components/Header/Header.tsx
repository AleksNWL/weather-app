import styles from "./Header.module.scss";
import Like from "../Like/Like.tsx";
import FavoritesList from "../FavoritesList/FavoritesList.tsx";
import ToggleTheme from "../ToggleTheme/ToggleTheme.tsx";
import Search from "../Search/Search.tsx";
import {useEffect, useState} from "react";
import {getCity} from "../../services/getCity.ts";
import {useCoordsCity} from "../../context/CoordsCityContext.tsx";
import {useWeather} from "../../context/WeatherContext.tsx";
import {usePollen} from "../../context/PollenContext.tsx";


export default function Header() {
    const { setCity, setCoordinate } = useCoordsCity();
    const { setCoordinates } = useWeather();
    const { setCoords } = usePollen();

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const detectedCity = await getCity(position.coords);
            if (detectedCity) {
                setCity(detectedCity);
                setCoordinate({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setCoordinates({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            }
        });

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1360);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <header style={{marginTop: "60px"}}>
            {isMobile ? (
                <div className={styles.search}>
                    <div className={styles.helpContainer}>
                        <div className={styles.likeContainer}>
                            <Like />
                            <FavoritesList />
                        </div>
                        <ToggleTheme />
                    </div>
                    <Search />
                </div>
            ) : (
                <div className={styles.search}>
                    <div className={styles.likeContainer}>
                        <Like />
                        <FavoritesList />
                    </div>
                    <Search />
                    <ToggleTheme />
                </div>
            )}
        </header>
    )
}