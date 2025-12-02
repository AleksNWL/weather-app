import { usePollen } from "../../context/PollenContext.tsx";
import { useState, useMemo } from "react";
import styles from "./PollenChart.module.scss";
import Alder from "/tools/alder.svg";
import Birch from "/tools/birch.svg";
import Grass from "/tools/grass.svg";
import Mugwort from "/tools/mugwort.svg";
import declineNameCity from "../../services/declineNameCity.ts";
import {useCoordsCity} from "../../context/CoordsCityContext.tsx";


type NormalizedPollenKey = "birchPollen" | "alderPollen" | "grassPollen" | "mugwortPollen";

interface GroupedEntry {
    time: string;
    birchPollen: number;
    alderPollen: number;
    grassPollen: number;
    mugwortPollen: number;
}

type PollenGroupedData = Record<string, GroupedEntry[]>;
type PollenAverages = Record<NormalizedPollenKey, Record<string, number>>;

interface ChartEntry {
    label: string;
    value: number;
}

const POLLEN_MAX: Record<NormalizedPollenKey, number> = {
    birchPollen: 1500,
    alderPollen: 1500,
    grassPollen: 200,
    mugwortPollen: 500
};

const getPollenLevel = (value: number, max: number): number => {
    const percent = (value * 100) / max;
    if (percent === 0) return 0;
    if (percent <= 5) return 3;
    if (percent <= 10) return 6;
    return 10;
};

const getColor = (level: number): string => {
    if (level <= 3) return "#9EFF36";
    if (level <= 6) return "#FFDA36";
    return "#FF6C36";
};

export function PollenChart() {
    const { pollen } = usePollen();
    const [choice, setChoice] = useState<NormalizedPollenKey>("birchPollen");
    const { city } = useCoordsCity();

    const groupedData = useMemo<PollenGroupedData | null>(() => {
        if (!pollen) return null;
        const result: PollenGroupedData = {};

        pollen.time.forEach((time, i) => {
            const day = time.split("T")[0];
            if (!result[day]) result[day] = [];

            result[day].push({
                time,
                birchPollen: pollen.birch_pollen[i],
                alderPollen: pollen.alder_pollen[i],
                grassPollen: pollen.grass_pollen[i],
                mugwortPollen: pollen.mugwort_pollen[i]
            });
        });

        return result;
    }, [pollen]);

    const averages = useMemo<PollenAverages | null>(() => {
        if (!groupedData) return null;

        const avg: PollenAverages = {
            birchPollen: {},
            alderPollen: {},
            grassPollen: {},
            mugwortPollen: {}
        };

        for (const [day, entries] of Object.entries(groupedData)) {
            const sums = {
                birchPollen: 0,
                alderPollen: 0,
                grassPollen: 0,
                mugwortPollen: 0
            };

            entries.forEach((entry) => {
                sums.birchPollen += entry.birchPollen;
                sums.alderPollen += entry.alderPollen;
                sums.grassPollen += entry.grassPollen;
                sums.mugwortPollen += entry.mugwortPollen;
            });

            const count = entries.length;
            (Object.keys(sums) as NormalizedPollenKey[]).forEach((key) => {
                avg[key][day] = Math.round(sums[key] / count);
            });
        }

        return avg;
    }, [groupedData]);

    if (!pollen || !groupedData || !averages) return <div>Loading...</div>;

    const today = Object.keys(groupedData)[0];

    const todayLevels: Record<NormalizedPollenKey, number> = {
        birchPollen: getPollenLevel(averages.birchPollen[today], POLLEN_MAX.birchPollen),
        alderPollen: getPollenLevel(averages.alderPollen[today], POLLEN_MAX.alderPollen),
        grassPollen: getPollenLevel(averages.grassPollen[today], POLLEN_MAX.grassPollen),
        mugwortPollen: getPollenLevel(averages.mugwortPollen[today], POLLEN_MAX.mugwortPollen)
    };

    const chartValues: ChartEntry[] = Object.entries(averages[choice]).map(([day, value]) => ({
        label: new Date(day).toLocaleDateString([], { weekday: "short" }).toUpperCase(),
        value: getPollenLevel(value, POLLEN_MAX[choice])
    }));

    const pollenOptions: { key: NormalizedPollenKey; label: string, img: string }[] = [
        { key: "birchPollen", label: "Береза", img: Birch },
        { key: "alderPollen", label: "Ольха", img: Alder },
        { key: "grassPollen", label: "Злаки", img: Grass },
        { key: "mugwortPollen", label: "Полынь", img: Mugwort },
    ];

    const selectedPollen = pollenOptions.find(t => t.key === choice);

    return (
        <>
            <span className={styles.heading}>Активность пыльцы в {declineNameCity(city)}</span>
            <div className={styles.containerPollen}>
                <div className={styles.containerFullSelection}>
                    <span className={styles.nowDay}>Сегодня</span>
                    <div className={styles.containerSelection}>
                        {pollenOptions.map(({ key, label, img }) => (
                            <div key={key} onClick={() => setChoice(key)} className={styles.choice}>
                                <p className={styles.choiceLabel}>{label}</p>
                                <div className={styles.containerImage}>
                                    <img src={img} alt={label} className={styles.image} />
                                    <div className={styles.containerLevel}>
                                        <div className={`${styles.high} ${todayLevels[key] > 6 ? styles.red : ""}`} />
                                        <div className={`${styles.middle} ${todayLevels[key] > 3 ? styles.yellow : ""}`} />
                                        <div className={`${styles.low} ${todayLevels[key] > 0 ? styles.green : ""}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.containerPollenBar}>
                    <p className={styles.barLabel}>{selectedPollen?.label}</p>
                    <div className={styles.containerBar}>
                        {chartValues.map((entry, i) => (
                            <div key={i} className={styles.setData}>
                                <div style={{
                                    height: `${entry.value === 0 ? 0 : 8 * entry.value}px`,
                                    width: "15px",
                                    backgroundColor: getColor(entry.value)
                                }}
                                     className={styles.levelPost}
                                />
                                <span className={styles.weekday}>{entry.label}</span>
                            </div>
                        ))}
                        <div className={styles.stripe}></div>
                    </div>
                </div>
            </div>
        </>
    );
}
