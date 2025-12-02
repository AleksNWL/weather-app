import { useWeather } from "../../context/WeatherContext.tsx";
import { getAllDay } from "../../services/getAllDay.ts";
import getIconWeather from "../../services/getIconWeather.ts";
import { useRef, useState } from "react";
import styles from "./DailyCarousel.module.scss";
import { Skeleton } from '@mui/material';


export default function DailyCarousel() {
    const { weather } = useWeather();
    const carouselRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    if (!weather) {
        return (
            <div className={styles["container-carousel"]}>
                <div className={styles["container-carousel__scroll"]}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={styles["container-carousel__item"]}>
                            <Skeleton variant="text" width={40} height={30} />
                            <Skeleton variant="circular" width={64} height={64} />
                            <Skeleton variant="text" width={40} height={30} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }


    const hourly = getAllDay(weather.hourly);
    const weatherInfoNow = getIconWeather(weather.current_weather.weathercode);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!carouselRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - carouselRef.current.offsetLeft);
        setScrollLeft(carouselRef.current.scrollLeft);
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!carouselRef.current || !isDragging) return;
        e.preventDefault();
        const x = e.pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!carouselRef.current) return;
        setIsDragging(true);
        setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
        setScrollLeft(carouselRef.current.scrollLeft);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!carouselRef.current || !isDragging) return;
        const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => setIsDragging(false);

    return (
        <div
            ref={carouselRef}
            className={styles["container-carousel"]}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className={styles["container-carousel__scroll"]}>
                <div className={styles["container-carousel__item"]}>
                    <span className={styles.name}>Сейчас</span>
                    <img src={weatherInfoNow.src} alt={weatherInfoNow.icon} className={styles.image} />
                    <span className={styles.temperature}>{Math.round(weather.current_weather.temperature)}°C</span>
                </div>
                {hourly.time.map((time, i) => {
                    const weatherInfo = getIconWeather(hourly.weathercode[i]);
                    const formattedTime = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    if (formattedTime.startsWith("00")) {
                        return (
                            <div key={time} className={styles["container-carousel__item-zero"]}>
                                <div className={styles["container-new-day"]}>
                                    <div className={styles["new-day__line"]}></div>
                                    <div className={styles["new-day__date"]}>
                                        {new Date(time).toLocaleDateString([], {
                                            weekday: "short",
                                            day: "2-digit"
                                        })}
                                    </div>
                                </div>
                                <div className={styles["container-carousel__item"]}>
                                    <span className={styles.name}>{formattedTime}</span>
                                    <img src={weatherInfo.src} alt={weatherInfo.icon} className={styles.image} />
                                    <span className={styles.temperature}>{Math.round(hourly.temperature_2m[i])}°C</span>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div key={time} className={styles["container-carousel__item"]}>
                                <span className={styles.name}>{formattedTime}</span>
                                <img src={weatherInfo.src} alt={weatherInfo.icon} className={styles.image} />
                                <span className={styles.temperature}>{Math.round(hourly.temperature_2m[i])}°C</span>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
}
