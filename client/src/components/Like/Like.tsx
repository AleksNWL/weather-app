import styles from "./Like.module.scss";
import { useState, useEffect } from "react";
import { useCoordsCity } from "../../context/CoordsCityContext.tsx";
import {motion} from "framer-motion";

type LikedLocation = {
    name: string;
    coords: {
        lat: number;
        lon: number;
    };
};


export default function Like() {
    const { coordinate, city } = useCoordsCity();

    const [liked, setLiked] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [customName, setCustomName] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("likedLocations");
        if (saved && coordinate) {
            try {
                const parsed = JSON.parse(saved);
                const isSameLocation = parsed.some((loc: LikedLocation) =>
                    loc.coords?.lat === coordinate.latitude &&
                    loc.coords?.lon === coordinate.longitude
                );
                setLiked(isSameLocation);
            } catch (e) {
                console.error("Ошибка при чтении localStorage:", e);
                setLiked(false);
            }
        } else {
            setLiked(false);
        }
    }, [coordinate]);


    const saveLocation = () => {
        const name = customName.trim() || city || "Текущее местоположение";

        if (coordinate) {
            const data = {
                name,
                coords: {
                    lat: coordinate.latitude,
                    lon: coordinate.longitude,
                },
            };

            const existing: LikedLocation[] = JSON.parse(localStorage.getItem("likedLocations") || "[]");

            const isAlreadySaved = existing.some(loc =>
                loc.coords.lat === data.coords.lat && loc.coords.lon === data.coords.lon
            );

            if (!isAlreadySaved) {
                existing.push(data);
                localStorage.setItem("likedLocations", JSON.stringify(existing));
                setLiked(true);
            }
        }

        setShowPopup(false);
        setCustomName("");
    };



    const handleLikeClick = () => {
        if (liked && coordinate) {
            const existing = JSON.parse(localStorage.getItem("likedLocations") || "[]");

            const updated = existing.filter((loc: LikedLocation) =>
                loc.coords.lat !== coordinate.latitude || loc.coords.lon !== coordinate.longitude
            );

            localStorage.setItem("likedLocations", JSON.stringify(updated));
            console.log("Локация удалена из избранного");
            setLiked(false);
        } else {
            setShowPopup(true);
        }
    };

    const saveDefaultLocation = () => {
        const defaultName = city || "Текущее местоположение";
        setCustomName(defaultName);
        saveLocation();
    };



    return (
        <>
            <motion.div onClick={handleLikeClick} whileHover={{scale: 1.2}} transition={{ duration: 2, type: "spring" }}>
                {liked ? (
                    <svg width="56" height="50" viewBox="0 0 56 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.likeOn} onClick={handleLikeClick}>
                        <g filter="url(#filter0_d_337_20)">
                            <path d="M7.72792 21.7279L28 42L48.2722 21.7279C50.659 19.341 52 16.1036 52 12.7279V12.157C52 5.4429 46.5571 0 39.8431 0C36.1498 0 32.657 1.67877 30.3499 4.56258L28 7.5L25.6501 4.56258C23.343 1.67877 19.8501 0 16.157 0C9.4429 0 4 5.4429 4 12.157V12.7279C4 16.1036 5.34097 19.341 7.72792 21.7279Z" fill="currentColor"/>
                        </g>
                        <defs>
                            <filter id="filter0_d_337_20" x="0" y="0" width="56" height="50" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                <feOffset dy="4"/>
                                <feGaussianBlur stdDeviation="2"/>
                                <feComposite in2="hardAlpha" operator="out"/>
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_337_20"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_337_20" result="shape"/>
                            </filter>
                        </defs>
                    </svg>

                ) : (
                    <svg width="56" height="50" viewBox="0 0 56 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.likeOff}>
                        <g filter="url(#filter0_d_337_30)">
                            <path fillRule="evenodd" clipRule="evenodd" d="M27.9813 3.4285C25.4365 1.2952 22.0887 0 18.4212 0C10.4566 0 4 6.10833 4 13.6433C4 17.1131 5.35037 20.298 7.60531 22.7055L28 42L47.7909 23.2767L48.376 22.6879C50.6309 20.2801 52 17.1131 52 13.6433C52 6.10833 45.5435 0 37.5787 0C33.9112 0 30.5635 1.2952 28.0187 3.42852L28 3.41086L27.9813 3.4285ZM28 8.52569L28.1464 8.64831L30.4211 6.4962L30.6581 6.29743C32.4981 4.75506 34.9152 3.81818 37.5787 3.81818C43.368 3.81818 48 8.24913 48 13.6433C48 16.116 47.036 18.3716 45.4301 20.1043L44.9312 20.6062L28 36.6243L10.514 20.0813C8.94381 18.3675 8 16.115 8 13.6433C8 8.24913 12.632 3.81818 18.4212 3.81818C21.0847 3.81818 23.5019 4.75506 25.3419 6.2974L25.5789 6.49608L27.8539 8.64823L28 8.52569Z" fill="currentColor"/>
                        </g>
                        <defs>
                            <filter id="filter0_d_337_30" x="0" y="0" width="56" height="50" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                <feOffset dy="4"/>
                                <feGaussianBlur stdDeviation="2"/>
                                <feComposite in2="hardAlpha" operator="out"/>
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_337_30"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_337_30" result="shape"/>
                            </filter>
                        </defs>
                    </svg>

                )}
            </motion.div>

            {showPopup && (
                <div className={styles.overlay} onClick={() => setShowPopup(false)}>
                    <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={() => setShowPopup(false)}>×</button>
                        <p className={styles.heading}>Избранное место</p>
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder={city || "Текущее местоположение"}
                            className={styles.popupInput}
                        />
                        <div className={styles.buttonGroup}>
                            <button onClick={saveLocation} className={styles.saveButton}>
                                Сохранить
                            </button>
                            <button onClick={saveDefaultLocation} className={styles.saveButton}>
                                По умолчанию
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </>
    );
}
