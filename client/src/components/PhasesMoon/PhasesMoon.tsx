import { useEffect, useState } from "react";
import { getMoonPhases } from "../../services/getPhasesMoon.ts";
import styles from "./PhasesMoon.module.scss";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

const moonPhases = [
    { id: 0, rus: "Новолуние", eng: "newMoon" },
    { id: 1, rus: "Растущая луна", eng: "waxingCrescent" },
    { id: 2, rus: "Первая четверть", eng: "firstQuarter" },
    { id: 3, rus: "Растущая луна", eng: "waxingGibbous" },
    { id: 4, rus: "Полнолуние", eng: "fullMoon" },
    { id: 5, rus: "Убывающая луна", eng: "waningGibbous" },
    { id: 6, rus: "Последняя четверть", eng: "lastQuarter" },
    { id: 7, rus: "Убывающая луна", eng: "waningCrescent" },
];

function toCamelCase(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map((word, idx) => idx === 0 ? word : word[0].toUpperCase() + word.slice(1))
        .join('');
}

export default function MoonPhases() {
    const [phaseEng, setPhaseEng] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const moonData = await getMoonPhases();
            if (moonData?.phase) {
                const camelCasePhase = toCamelCase(moonData.phase);
                setPhaseEng(camelCasePhase);
            }
        })();
    }, []);

    if (!phaseEng) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <Skeleton variant="circular" width={120} height={120} />
                <Skeleton variant="text" width={160} height={32} />
            </Box>
        );
    }

    const phase = moonPhases.find(p => p.eng === phaseEng) || moonPhases[0];

    return (
        <>
            <img src={`/phasesMoon/${phase.eng}.svg`} alt={phase.eng} className={styles.image} />
            <span className={styles.description}>{phase.rus}</span>
        </>
    );
}
