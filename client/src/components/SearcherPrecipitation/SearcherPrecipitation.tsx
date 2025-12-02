import {useWeather} from "../../context/WeatherContext.tsx";
import {getAllDay} from "../../services/getAllDay.ts";
import {useState, useEffect} from "react";
import styles from "./SearcherPrecipitation.module.scss";


export default function SearcherPrecipitation() {
    const [message, setMessage] = useState<string>("Осадки не ожидаются");

    const { weather } = useWeather();

    useEffect(() => {
        if (!weather) return;

        const hourly = getAllDay(weather.hourly);
        const nowWeathercode = weather.current_weather.weathercode;
        console.log(nowWeathercode);

        const now = new Date();
        const index = hourly.time.findIndex((t) => {
            const hourTime = new Date(t);
            return hourTime > now;
        })

        const nextIndex = Math.max(0, index);

        const weatherDictionary: { [weather: string]: number[] } = {
            "Небольшой дождь": [51, 53, 55],
            "Дождь": [61, 63, 65, 66, 67, 80, 81, 82],
            "Снег": [71, 73, 75, 77],
        }

        const getType = (code: number | undefined): string | null => {
            if (code === undefined || code === null) return null;
            return Object.entries(weatherDictionary).find(([, codes]) =>
                codes.includes(code)
            )?.[0] ?? null;
        }


        const currentType = getType(nowWeathercode);

        if (currentType) {
            let count = 0;
            for (let i = nextIndex; i < nextIndex + 3; i++) {
                const code = hourly.weathercode[i];
                if (getType(code) === currentType) {
                    count++;
                } else {
                    break;
                }
            }

            if (count === 0) setMessage(`${currentType} закончится в течение часа`);
            if (count === 1) setMessage(`${currentType} закончится в течение двух часов`);
            if (count >= 2) setMessage(`${currentType} не закончится в ближайшее время`);
        }

        else {
            let startOffset = -1;
            let count = 0;

            for (let i = nextIndex; i < nextIndex + 2; i++) {
                const futureType = getType(hourly.weathercode[i]);
                if (futureType) {
                    if (startOffset === -1) startOffset = i - nextIndex;
                    if (futureType === getType(hourly.weathercode[i])) count++;
                    else break;
                }
            }

            if (startOffset === -1) {
                setMessage("Осадки не ожидаются в течение двух часов")
            } else {
                const startText = startOffset === 0
                    ? "в течение часа"
                    : "в течение двух часов";

                setMessage(`${getType(hourly.weathercode[nextIndex + startOffset])} начнется ${startText} 
                и продлится около ${count === 1 ? "одного часа" : "двух часов"}`)
            }
        }
    }, [weather])

    return (
        <span className={styles.message}>
            {message}
        </span>
    );
}