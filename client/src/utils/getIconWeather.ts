interface WeatherInfo {
    icon: string;
    src: string;
    title: string;
}

export default function getIconWeather(weathercode: number): WeatherInfo {
    console.log('🔍 getIconWeather вызвана с weathercode:', weathercode, 'тип:', typeof weathercode);
    
    const weatherMap: {[code: number]: {icon: string, title: string}} = {
        0: { icon: "sun", title: "Ясно" },
        1: { icon: "mainly_clear", title: "Преимущественно ясно" },
        2: { icon: "partly_cloudy", title: "Переменная облачность" },
        3: { icon: "overcast", title: "Пасмурно" },
        45: { icon: "fog", title: "Туман" },
        48: { icon: "fog", title: "Туман" },
        51: { icon: "drizzle_light", title: "Слабая морось" },
        53: { icon: "drizzle_moderate", title: "Умеренная морось" },
        55: { icon: "drizzle_dense_intensity", title: "Сильная морось" },
        56: { icon: "freezing_drizzle", title: "Переохлаждённая морось" },
        57: { icon: "freezing_drizzle", title: "Переохлаждённая морось" },
        61: { icon: "rain_slight", title: "Слабый дождь" },
        63: { icon: "rain_moderate", title: "Умеренный дождь" },
        65: { icon: "rain_heavy_intensity", title: "Сильный дождь" },
        66: { icon: "freezing_rain", title: "Переохлаждённый дождь" },
        67: { icon: "freezing_rain", title: "Переохлаждённый дождь" },
        71: { icon: "snow_fall_slight", title: "Слабый снег" },
        73: { icon: "snow_fall_moderate", title: "Умеренный снег" },
        75: { icon: "snow_fall_heavy_intensity", title: "Сильный снег" },
        77: { icon: "snow_fall_moderate", title: "Ледяная крупа" },
        80: { icon: "rain_slight", title: "Слабый ливень" },
        81: { icon: "rain_moderate", title: "Умеренный ливень" },
        82: { icon: "rain_heavy_intensity", title: "Сильный ливень" },
        85: { icon: "snow_fall_moderate", title: "Снегопад" },
        86: { icon: "snow_fall_heavy_intensity", title: "Сильный снегопад" },
        95: { icon: "thunderstorm", title: "Гроза" },
        96: { icon: "thunderstorm_hail", title: "Гроза с градом" },
        99: { icon: "thunderstorm_hail", title: "Гроза с сильным градом" }
    };

    const fallback = { icon: "celsius", title: "Неизвестная погода" };
    const weather = weatherMap[weathercode] || fallback;
    
    console.log('📍 Найдена погода в map:', weather);
    console.log('✅ Возвращаемый путь иконки:', `/weatherIcons/${weather.icon}.svg`);

    return {
        icon: weather.icon,
        title: weather.title,
        src: `/weatherIcons/${weather.icon}.svg`
    };
}
