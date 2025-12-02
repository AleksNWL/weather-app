import React, { useEffect, useRef, useState } from "react";
import Arrow from "/tools/arrow.svg";
import styles from "./WeekCarousel.module.scss";
import { useWeather } from "../../context/WeatherContext.tsx";
import getIconWeather from "../../services/getIconWeather.ts";
import { useCoordsCity } from "../../context/CoordsCityContext.tsx";
import declineNameCity from "../../services/declineNameCity.ts";
import Umbrella from "/tools/umbrella.svg";
import { Skeleton } from "@mui/material";
import { Link } from "react-router";


interface HourlyData {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation: number[];
    precipitation_probability: number[];
    weathercode: number[];
}

interface DailyData {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation: number[];
    precipitation_probability: number[];
    weathercode: number[];
}

export default function WeekCarousel() {
    const { weather } = useWeather();
    const { city } = useCoordsCity();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    useEffect(() => {
        const current = scrollRef.current;
        if (!current) return;

        updateArrowVisibility();

        const onScroll = () => {
            updateArrowVisibility();
        };

        current.addEventListener("scroll", onScroll);
        return () => current.removeEventListener("scroll", onScroll);
    }, []);

    if (!weather || !weather.hourly)
        return (
            <div className={styles.weekCarousel} style={{ padding: "1rem" }}>
                <Skeleton variant="text" width={300} height={40} style={{ marginBottom: 16 }} />
                <Skeleton variant="rectangular" width="100%" height={180} />
            </div>
        );

    const dailyData = splitHourlyDataIntoDays(weather.hourly);

    const formatTemp = (temp: number) => {
        const rounded = Math.round(temp);
        return rounded >= 0 ? `+${rounded}` : `${rounded}`;
    };

    function splitHourlyDataIntoDays(hourly: HourlyData): DailyData[] {
        const days: DailyData[] = [];

        for (let dayIndex = 0; dayIndex < 10; dayIndex++) {
            const start = dayIndex * 24;
            const end = start + 24;

            const dayData: DailyData = {
                time: hourly.time.slice(start, end),
                temperature_2m: hourly.temperature_2m.slice(start, end),
                apparent_temperature: hourly.apparent_temperature.slice(start, end),
                precipitation: hourly.precipitation.slice(start, end),
                precipitation_probability: hourly.precipitation_probability.slice(start, end),
                weathercode: hourly.weathercode.slice(start, end),
            };

            days.push(dayData);
        }

        return days;
    }

    const updateArrowVisibility = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        setIsDragging(false);
        updateArrowVisibility();
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
        updateArrowVisibility();
    };

    const scrollByAmount = (amount: number) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    };

    const onTouchStart = (e: React.TouchEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !scrollRef.current) return;
        const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const onTouchEnd = () => {
        setIsDragging(false);
        updateArrowVisibility();
    };

    return (
        <div className={styles.weekCarousel}>
            <Link to={"/weather-next-ten-day"} className={styles.header}>
                <h2 className={styles.title}>Погода в {declineNameCity(city)} на 10 дней</h2>
                <img src={Arrow} alt="arrow" className={styles.arrowIcon} />
            </Link>

            <div className={styles.carouselWrapper}>
                {showLeftArrow && (
                    <button
                        className={`${styles.arrowButton} ${styles.left}`}
                        onClick={() => scrollByAmount(-200)}
                        aria-label="Scroll Left"
                        type="button"
                        style={{ transform: "rotate(180deg)" }}
                    >
                        <img src={Arrow} alt="left arrow" />
                    </button>
                )}

                <div
                    className={styles.dayList}
                    ref={scrollRef}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseLeave}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    style={{
                        cursor: isDragging ? "grabbing" : "grab",
                        userSelect: isDragging ? "none" : "auto",
                        overflowX: "hidden",
                    }}
                >
                    {dailyData.map((day, index) => {
                        const weatherInfo = getIconWeather(Math.max(...day.weathercode));

                        return (
                            <div key={index} className={styles.dayItem}>
                                <span className={styles.weekDay}>
                                  {new Date(day.time[0]).toLocaleDateString("ru-RU", {
                                      weekday: "short",
                                  })}
                                </span>

                                <img src={weatherInfo.src} alt={weatherInfo.icon} className={styles.weatherIcon} />

                                <div className={styles.info}>
                                    <span className={styles.temp}>
                                        {formatTemp(Math.min(...day.temperature_2m))}...{formatTemp(Math.max(...day.temperature_2m))}
                                    </span>

                                    <div className={styles.precipitation}>
                                        <img src={Umbrella} alt={Umbrella} className={styles.umbrella} />
                                        <span className={styles.precipitationValue}>{Math.max(...day.precipitation_probability)}%</span>
                                    </div>

                                    <span className={styles.weatherDescription}>{weatherInfo.title}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {showRightArrow && (
                    <button
                        className={`${styles.arrowButton} ${styles.right}`}
                        onClick={() => scrollByAmount(200)}
                        aria-label="Scroll Right"
                        type="button"
                    >
                        <img src={Arrow} alt="right arrow" />
                    </button>
                )}
            </div>
        </div>
    );
}
