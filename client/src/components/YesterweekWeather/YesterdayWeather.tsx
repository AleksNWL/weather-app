import { useEffect, useState } from "react";
import { useCoordsCity } from "../../context/CoordsCityContext.tsx";
import { getLastWeekWeatherAtSameTime } from "../../services/getYesterweekWeather.ts";
import drop from "/tools/drop.svg";
import wind from "/tools/wind.svg";
import pressure from "/tools/pressure.svg";
import thermometer from "/tools/thermometer.svg";
import getIconWeather from "../../services/getIconWeather.ts";
import styles from "./YesterdayWeather.module.scss";
import { Skeleton } from "@mui/material";

interface WeatherProps {
    temperature_2m: number;
    apparent_temperature: number;
    weathercode: number;
    pressure_msl: number;
    relative_humidity_2m: number;
    windspeed: number;
}

export default function YesterdayWeather() {
    const { coordinate } = useCoordsCity();
    const [yesterweekWeather, setYesterweekWeather] = useState<WeatherProps | null | undefined>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (coordinate) {
                const data = await getLastWeekWeatherAtSameTime(coordinate);
                setYesterweekWeather(data);
                setLoading(false);
            }
        };

        fetchData();
    }, [coordinate]);

    if (loading)
        return (
            <>
                <Skeleton variant="text" width={180} height={32} style={{ marginBottom: 12 }} />
                <div className={styles.container}>
                    <div className={styles.containerMiddle}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={styles.containerMini}>
                                <Skeleton variant="circular" width={24} height={24} />
                                <Skeleton variant="text" width={80} height={24} />
                            </div>
                        ))}
                    </div>
                    <div className={styles.containerImage}>
                        <Skeleton variant="circular" width={120} height={120} />
                    </div>
                </div>
            </>
        );

    if (!yesterweekWeather) return <div>Нет данных за вчера</div>;

    const weatherInfo = getIconWeather(yesterweekWeather.weathercode);

    return (
        <>
            <span className={styles.heading}>Неделю назад в этот день</span>
            <div className={styles.container}>
                <div className={styles.containerMiddle}>
                    <div className={styles.containerMini}>
                        <img src={thermometer} alt="thermometer" className={styles.icon} />
                        <span className={styles.description}>{yesterweekWeather.temperature_2m}°C</span>
                    </div>
                    <div className={styles.containerMini}>
                        <img src={drop} alt="drop" className={styles.icon} />
                        <span className={styles.description}>{yesterweekWeather.relative_humidity_2m}%</span>
                    </div>
                    <div className={styles.containerMini}>
                        <img src={pressure} alt="pressure" className={styles.icon} />
                        <span className={styles.description}>{Math.round(yesterweekWeather.pressure_msl * 0.75006)} мм рт. ст.</span>
                    </div>
                    <div className={styles.containerMini}>
                        <img src={wind} alt="wind" className={styles.icon} />
                        <span className={styles.description}>{yesterweekWeather.windspeed} м/с</span>
                    </div>
                </div>
                <div className={styles.containerImage}>
                    <img src={weatherInfo.src} alt={weatherInfo.icon} className={styles.weatherIcon} />
                </div>
            </div>
        </>
    );
}
