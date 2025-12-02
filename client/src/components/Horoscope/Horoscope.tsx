import styles from "./Horoscope.module.scss";
import { useEffect, useState } from "react";
import getHoroscope from "../../services/getHoroscope";
import { Skeleton } from "@mui/material";  // импортируем Skeleton

const zodiacSigns = [
    { sign: "aries", label: "Овен", icon: "♈️" },
    { sign: "taurus", label: "Телец", icon: "♉️" },
    { sign: "gemini", label: "Близнецы", icon: "♊️" },
    { sign: "cancer", label: "Рак", icon: "♋️" },
    { sign: "leo", label: "Лев", icon: "♌️" },
    { sign: "virgo", label: "Дева", icon: "♍️" },
    { sign: "libra", label: "Весы", icon: "♎️" },
    { sign: "scorpio", label: "Скорпион", icon: "♏️" },
    { sign: "sagittarius", label: "Стрелец", icon: "♐️" },
    { sign: "capricorn", label: "Козерог", icon: "♑️" },
    { sign: "aquarius", label: "Водолей", icon: "♒️" },
    { sign: "pisces", label: "Рыбы", icon: "♓️" },
];

export default function Horoscope() {
    const [sign, setSign] = useState(() => localStorage.getItem("selectedSign") || "leo");
    const [horoscope, setHoroscope] = useState("");
    const [loading, setLoading] = useState(true);

    const CACHE_KEY = `horoscope_${sign}`;
    const CACHE_EXP_KEY = `${CACHE_KEY}_expiry`;

    const translateText = async (text: string) => {
        try {
            const encodedText = encodeURIComponent(text);
            const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ru`;

            const response = await fetch(url);
            const data = await response.json();

            return data.responseData.translatedText;
        } catch (error) {
            console.error("Ошибка перевода:", error);
            return null;
        }
    };

    const getExpiryTime = () => {
        const now = new Date();
        const tomorrowMidnight = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0,
            0,
            0,
            0
        );
        return tomorrowMidnight.getTime();
    };

    useEffect(() => {
        const fetchAndTranslateHoroscope = async () => {
            try {
                setLoading(true);
                const cachedData = localStorage.getItem(CACHE_KEY);
                const expiry = localStorage.getItem(CACHE_EXP_KEY);
                const now = Date.now();

                if (cachedData && expiry && now < +expiry) {
                    setHoroscope(cachedData);
                    setLoading(false);
                    return;
                }

                const data = await getHoroscope(sign);

                if (data) {
                    const sentences = data.match(/[^.!?]+[.!?]+/g);
                    let shortHoroscope = data;

                    if (sentences) {
                        if (data.length > 280) {
                            shortHoroscope = sentences[0];
                        } else {
                            shortHoroscope = sentences.slice(0, 2).join(" ");
                        }
                    }

                    const translated = await translateText(shortHoroscope);

                    if (translated) {
                        setHoroscope(translated);
                        localStorage.setItem(CACHE_KEY, translated);
                        localStorage.setItem(CACHE_EXP_KEY, getExpiryTime().toString());
                    } else {
                        setHoroscope("Гороскоп недоступен.");
                    }
                } else {
                    setHoroscope("Гороскоп недоступен.");
                }
            } catch (error) {
                console.error("Ошибка в fetchAndTranslateHoroscope:", error);
                setHoroscope("Гороскоп недоступен.");
            } finally {
                setLoading(false);
            }
        };

        fetchAndTranslateHoroscope();
    }, [sign]);

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSign = e.target.value;
        setSign(newSign);
        localStorage.setItem("selectedSign", newSign);
    };

    return (
        <>
            <div className={styles.header}>
                <span className={styles.heading}>Гороскоп на сегодня</span>
                <select
                    className={styles.selector}
                    value={sign}
                    onChange={handleSelect}
                    aria-label="Выбор"
                >
                    {zodiacSigns.map(({ sign: s, label, icon }) => (
                        <option key={s} value={s}>
                            {icon} {label}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <Skeleton variant="rectangular" width="100%" height={100} />
            ) : (
                <p className={styles.text}>{horoscope}</p>
            )}
        </>
    );
}
