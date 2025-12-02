
interface hourlyWeatherType {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
}

export function getAllDay(data: hourlyWeatherType) {
    const now = new Date();

    const index = data.time.findIndex((t) => {
        const hourTime = new Date(t);
        return hourTime > now;
    })

    const start = Math.max(0, index);
    const end = start + 24;

    return {
        time: data.time.slice(start, end),
        temperature_2m: data.temperature_2m.slice(start, end),
        weathercode: data.weathercode.slice(start, end),
    }
}