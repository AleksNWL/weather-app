import { useWeather } from "../../context/WeatherContext";
import getIconWeather from "../../services/getIconWeather";
import styles from "./NextTenDay.module.scss";
import { Skeleton } from '@mui/material';
import {Link} from "react-router";
import Arrow from "/tools/arrow.svg";


interface DayData {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
    precipitation_probability: number[];
    windgusts_10m: number[];
}

interface BlockData {
    weathercode: number;
    temp: number;
    precipitation: number;
    wind: number;
}


export default function NextTenDay() {
    const { weather } = useWeather();

    if (!weather) {
        return (
            <div className={styles.nextTenDay}>
                <h1>Назад</h1>
                {[...Array(10)].map((_, dayIndex) => (
                    <div key={dayIndex} className={styles.dayBlock}>
                        <h3 className={styles.date}>
                            <Skeleton variant="text" width={140} height={32} />
                        </h3>
                        <div className={styles.blocks}>
                            {[...Array(4)].map((_, blockIndex) => (
                                <div key={blockIndex} className={styles.timeBlock}>
                                    <div className={styles.info}>
                                        <h4 className={styles.timeDay}>
                                            <Skeleton variant="text" width={60} height={24} />
                                        </h4>
                                        <p className={styles.label}><Skeleton variant="text" width={30} height={20} /></p>
                                        <p className={styles.label}><Skeleton variant="text" width={30} height={20} /></p>
                                        <p className={styles.label}><Skeleton variant="text" width={30} height={20} /></p>
                                        <p className={styles.label}><Skeleton variant="text" width={80} height={20} /></p>
                                    </div>
                                    <Skeleton variant="circular" width={48} height={48} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const { time, temperature_2m, weathercode, precipitation_probability, windgusts_10m } = weather.hourly;

    const days = [];
    for (let i = 0; i < time.length; i += 24) {
        days.push({
            time: time.slice(i, i + 24),
            temperature_2m: temperature_2m.slice(i, i + 24),
            weathercode: weathercode.slice(i, i + 24),
            precipitation_probability: precipitation_probability.slice(i, i + 24),
            windgusts_10m: windgusts_10m.slice(i, i + 24),
        });
    }

    const getLabelForDay = (index: number, dateString: string) => {
        const date = new Date(dateString);
        if (index === 0) return `Сегодня (${date.toLocaleDateString("ru-RU")})`;
        if (index === 1) return `Завтра (${date.toLocaleDateString("ru-RU")})`;
        return `${date.toLocaleDateString("ru-RU", { weekday: "short" }).toUpperCase()} (${date.toLocaleDateString("ru-RU")})`;
    };

    const getBlockData = (startHour: number, endHour: number, dayData: DayData): BlockData => {
        const range = [];
        for (let i = startHour; i <= endHour; i++) {
            range.push({
                time: dayData.time[i],
                temp: dayData.temperature_2m[i],
                code: dayData.weathercode[i],
                precipitation: dayData.precipitation_probability[i],
                wind: dayData.windgusts_10m[i],
            });
        }

        const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

        return {
            weathercode: range[0].code,
            temp: avg(range.map(x => x.temp)),
            precipitation: avg(range.map(x => x.precipitation)),
            wind: avg(range.map(x => x.wind)),
        };
    };


    const blocks = [
        { label: "Ночью", hours: [0, 5] },
        { label: "Утром", hours: [6, 11] },
        { label: "Днём", hours: [12, 17] },
        { label: "Вечером", hours: [18, 23] },
    ];

    return (
        <div className={styles.nextTenDay}>
            <Link to={"/"} className={styles.link}>
                <img src={Arrow} alt={Arrow} style={{rotate: "180deg"}}/>
                <span className={styles.linkText}>Назад</span>
            </Link>
            {days.slice(0, 10).map((day, i) => (
                <div key={i} className={styles.dayBlock}>
                    <h3 className={styles.date}>{getLabelForDay(i, day.time[0])}</h3>
                    <div className={styles.blocks}>
                        {blocks.map(({ label, hours }) => {
                            const data = getBlockData(hours[0], hours[1], day);
                            const iconInfo = getIconWeather(data.weathercode);

                            return (
                                <div key={label} className={styles.timeBlock}>
                                    <div className={styles.info}>
                                        <h4 className={styles.timeDay}>{label}</h4>
                                        <p className={styles.label}>{data.temp}°C</p>
                                        <p className={styles.label}>{data.precipitation}%</p>
                                        <p className={styles.label}>{data.wind} м/с</p>
                                        <p className={styles.label}>{iconInfo.title}</p>
                                    </div>
                                    <img
                                        src={iconInfo.src}
                                        alt={iconInfo.title}
                                        className={styles.icon}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
