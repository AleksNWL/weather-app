import { useWeather } from "../../context/WeatherContext.tsx";
import "./Visibility.scss";
import { Skeleton } from "@mui/material";

const levelInfo = [
    { max: 50, level: 1, color: "#fe6a69", label: "Очень плотный туман" },
    { max: 200, level: 2, color: "#fe6a69", label: "Плотный туман" },
    { max: 500, level: 3, color: "#ff9b57", label: "Сильный туман" },
    { max: 1000, level: 4, color: "#fdd64b", label: "Умеренный туман" },
    { max: 2000, level: 5, color: "#fdd64b", label: "Лёгкий туман" },
    { max: 4000, level: 6, color: "#a8e05f", label: "Нормальная" },
    { max: 8000, level: 7, color: "#a8e05f", label: "Хорошая" },
    { max: 12000, level: 8, color: "#00e400", label: "Очень хорошая" },
    { max: 20000, level: 9, color: "#00e400", label: "Отличная" },
    { max: Infinity, level: 10, color: "#ffffff", label: "Идеальная" },
];

export default function Visibility() {
    const { weather } = useWeather();

    if (!weather)
        return (
            <div style={{ padding: "10px 0" }}>
                <Skeleton variant="rectangular" width={200} height={70} />
            </div>
        );

    const nowTime = new Date();
    const now = weather.hourly.time.findIndex((t) => new Date(t) >= nowTime);
    const visibility = weather.hourly.visibility[now];

    const levelData = levelInfo.find((l) => visibility <= l.max)!;

    return (
        <>
            <div className="container__visibility">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="visibility-item"
                        style={{
                            backgroundColor: i < levelData.level ? levelData.color : "#d1d5db",
                            width: `${i + 5}px`,
                            height: `${i * 5 + 55}px`,
                        }}
                    />
                ))}
            </div>

            <p style={{ fontWeight: "600" }}>
                {levelData.label}&nbsp;
                <span
                    style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: levelData.color,
                    }}
                ></span>
            </p>
        </>
    );
}
