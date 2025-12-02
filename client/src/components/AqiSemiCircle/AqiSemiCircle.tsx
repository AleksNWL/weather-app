import { useEffect, useRef, useState } from "react";
import { getAirData } from "../../services/getAir.ts";
import { useCoordsCity } from "../../context/CoordsCityContext.tsx";
import styles from "./AqiSemiCircle.module.scss";
import { Skeleton } from "@mui/material";

const getAQIColor = (aqi: number): string => {
    if (aqi <= 20) return "#00e400";
    if (aqi <= 40) return "#a8e05f";
    if (aqi <= 60) return "#fdd64b";
    if (aqi <= 80) return "#ff9b57";
    if (aqi <= 100) return "#fe6a69";
    return "#a97abc";
};

const getAQIText = (aqi: number): string => {
    if (aqi <= 20) return "Очень хорошее";
    if (aqi <= 40) return "Хорошее";
    if (aqi <= 60) return "Удовлетворительное";
    if (aqi <= 80) return "Умеренно плохое";
    if (aqi <= 100) return "Плохое";
    return "Очень плохое";
};

export function AqiSemiCircle({ maxAQI = 150 }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [airData, setAirData] = useState<{ aqi: number | null; uv: number | null }>({ aqi: null, uv: null });
    const { coordinate } = useCoordsCity();

    useEffect(() => {
        const fetchAirData = async () => {
            if (coordinate) {
                try {
                    const data = await getAirData(coordinate);
                    setAirData(data);
                } catch (err) {
                    console.error("Ошибка при получении данных воздуха:", err);
                }
            }
        };
        fetchAirData();
    }, [coordinate]);

    const aqi = airData.aqi;

    useEffect(() => {
        if (aqi === null || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height;
        const radius = 100;
        const lineWidth = 15;

        const angle = Math.PI + Math.PI * (Math.min(aqi, maxAQI) / maxAQI);
        const color = getAQIColor(aqi);

        ctx.clearRect(0, 0, width, height);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI, false);
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        const endX = cx + radius * Math.cos(angle);
        const endY = cy + radius * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(endX, endY, 12, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }, [aqi, maxAQI]);

    return (
        <div className={styles.container}>
            <canvas ref={canvasRef} width={300} height={140} />
            {aqi !== null ? (
                <>
                    <div className={styles.name}>AQI: {aqi}</div>
                    <div style={{ color: getAQIColor(aqi) }} className={styles.aqi}>{getAQIText(aqi)}</div>
                </>
            ) : (
                <>
                    <Skeleton variant="text" width={80} height={30} style={{ margin: "0 auto" }} />
                    <Skeleton variant="text" width={120} height={25} style={{ margin: "0 auto", marginTop: 8 }} />
                </>
            )}
        </div>
    );
}

export default AqiSemiCircle;
