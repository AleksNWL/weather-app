import {useEffect, useState} from "react";

type Theme = "light" | "dark";

export default function useTheme(): [Theme, (theme: Theme) => void] {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        return saved ?? "light";
    })

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return [theme, setTheme];
}