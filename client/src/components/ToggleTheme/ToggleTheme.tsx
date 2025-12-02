import useTheme from "../../hooks/useTheme.tsx";
import { motion } from "motion/react";
import LightImg from "/tools/light.svg";
import DarkImg from "/tools/dark.svg";
import styles from "./ToggleTheme.module.scss";


export default function ToggleTheme() {
    const [theme, setTheme] = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    }

    return (
        <motion.div
            whileHover={{
                rotate: 30
            }}
        >
            {theme === "light" ? (<img src={DarkImg} alt={theme} onClick={() => toggleTheme()} className={styles.light}/>) : (<img src={LightImg} alt={theme} onClick={() => toggleTheme()} className={styles.dark} />) }
        </motion.div>
    )
}