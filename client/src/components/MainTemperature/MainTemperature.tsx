import { useWeather } from "../../context/WeatherContext.tsx";
import styles from "./MainTemperature.module.scss";
import getIconWeather from "../../services/getIconWeather.ts";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

export default function MainTemperature() {
    const { weather } = useWeather();

    if (!weather) {
        return (
            <Box className={styles.mainContainer}>
                <Box className={styles.container}>
                    <Skeleton variant="text" width={150} height={96} />
                    <Skeleton variant="text" width={200} height={32} />
                </Box>
                <Skeleton variant="circular" width={120} height={120} />
            </Box>
        );
    }

    const now = new Date();
    const indexNow = weather.hourly.time.findIndex((t: string) => new Date(t) > now);
    const weatherInfo = getIconWeather(weather.current_weather.weathercode);

    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                {Math.round(weather.current_weather.temperature) >= 0
                    ? <span className={styles.temperature}>+{Math.round(weather.current_weather.temperature)}°C</span>
                    : <span className={styles.temperature}>{Math.round(weather.current_weather.temperature)}°C</span>
                }
                {Math.round(weather.hourly.apparent_temperature[indexNow]) >= 0
                    ? <span className={styles.apparentTemperature}>Ощущается как +{Math.round(weather.hourly.apparent_temperature[indexNow])}°C</span>
                    : <span className={styles.apparentTemperature}>Ощущается как {Math.round(weather.hourly.apparent_temperature[indexNow])}°C</span>
                }
            </div>
            <img src={weatherInfo.src} alt={weatherInfo.icon} className={styles.icon} />
        </div>
    );
}
