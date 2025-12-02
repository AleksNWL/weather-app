import { useEffect, useState } from "react";
import styles from "./Home.module.scss";
import MainTemperature from "../../components/MainTemperature/MainTemperature.tsx";
import DailyCarousel from "../../components/DailyCarousel/DailyCarousel.tsx";
import MainWeatherInfo from "../../components/MainWeatherInfo/MainWeatherInfo.tsx";
import SearcherPrecipitation from "../../components/SearcherPrecipitation/SearcherPrecipitation.tsx";
import { PollenChart } from "../../components/PollenChart/PollenChart.tsx";
import WeekCarousel from "../../components/WeekCarousel/WeekCarousel.tsx";
import AqiSemiCircle from "../../components/AqiSemiCircle/AqiSemiCircle.tsx";
import YesterdayWeather from "../../components/YesterweekWeather/YesterdayWeather.tsx";
import MagneticStorm from "../../components/MagneticStorm/MagneticStorm.tsx";
import Visibility from "../../components/Visibility/Visibility.tsx";
import MoonPhases from "../../components/PhasesMoon/PhasesMoon.tsx";
import UVIndex from "../../components/UVIndex/UVIndex.tsx";
import Horoscope from "../../components/Horoscope/Horoscope.tsx";

export default function Home() {

    const [isMobile, setIsMobile] = useState(false);
    const [isBigDisplay, setIsBigDisplay] = useState(false);

    useEffect(() => {

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1360);
            setIsBigDisplay(window.innerWidth >= 1620);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={styles.mainContainer}>

            <div className={styles.mainWeather}>
                <div className={styles.mainTemperature}>
                    <MainTemperature />
                    <SearcherPrecipitation />
                </div>
                <div className={styles.mainWeatherInfo}>
                    <MainWeatherInfo />
                </div>
            </div>

            <div className={styles.dailyContainer}>
                <DailyCarousel />
            </div>

            <div className={styles.additionalContainer} style={{ height: "100%" }}>
                <div className={styles.middleContainer}>
                    <YesterdayWeather />
                </div>

                { (isMobile || isBigDisplay)
                    ?
                    <div className={styles.sharedContainer}>
                        <div className={styles.littleContainer}>
                            <span className={styles.heading}>Качество воздуха</span>
                            <AqiSemiCircle />
                        </div>
                        <div className={`${styles.littleContainer} ${styles.innerContainer}`}>
                            <span className={styles.heading}>UV-индекс</span>
                            <UVIndex />
                        </div>
                    </div>
                    :
                    <>
                        <div className={styles.littleContainer}>
                            <span className={styles.heading}>Качество воздуха</span>
                            <AqiSemiCircle />
                        </div>
                        <div className={`${styles.littleContainer} ${styles.innerContainer}`}>
                            <span className={styles.heading}>UV-индекс</span>
                            <UVIndex />
                        </div>
                    </>
                }

                <div className={`${styles.highContainer} ${styles.pollenContainer}`}>
                    <PollenChart />
                </div>

                { (isMobile || isBigDisplay)
                    ?
                    <div className={styles.sharedContainer}>
                        <div className={`${styles.littleContainer} ${styles.innerContainer}`}>
                            <span className={styles.heading}>Магнитное поле</span>
                            <MagneticStorm />
                        </div>
                        <div className={`${styles.littleContainer} ${styles.innerContainer}`}>
                            <span className={styles.heading}>Фаза луны</span>
                            <MoonPhases />
                        </div>
                    </div>
                    :
                    <>
                        <div className={`${styles.littleContainer} ${styles.innerContainer}`}>
                            <span className={styles.heading}>Магнитное поле</span>
                            <MagneticStorm />
                        </div>
                        <div className={`${styles.littleContainer} ${styles.innerContainer}`}>
                            <span className={styles.heading}>Фаза луны</span>
                            <MoonPhases />
                        </div>
                    </>
                }

                <div className={`${styles.middleContainer} ${styles.innerContainer}`}>
                    <span className={styles.heading}>Видимость на дорогах</span>
                    <Visibility />
                </div>
                <div className={`${styles.highContainer} ${styles.innerContainer}`}>
                    <Horoscope />
                </div>
            </div>

            <div className={styles.weeklyContainer}>
                <WeekCarousel />
            </div>
        </div>
    );
}
