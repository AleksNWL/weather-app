export interface WeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utf_offset_seconds: number;
    timezone: string;
    elevation: number;
    timezone_abbreviation: string;
    current_weather: CurrentWeather;
    current_weather_units: CurrentWeatherUnits;
    hourly: Hourly;
    hourly_units: HourlyUnits;
}

interface CurrentWeather {
    interval: number;
    is_day: number;
    temperature: number;
    time: string;
    weathercode: number;
    winddirection: number;
    windspeed: number;
}

interface CurrentWeatherUnits {
    interval: string;
    is_day: string;
    temperature: string;
    time: string;
    weathercode: string;
    winddirection: string;
    windspeed: string;
}

interface Hourly {
    apparent_temperature: number[];
    precipitation: number[];
    precipitation_probability: number[];
    pressure_msl: number[];
    relative_humidity_2m: number[];
    temperature_2m: number[];
    time: string[];
    visibility: number[];
    weathercode: number[];
    windgusts_10m: number[];
}

interface HourlyUnits {
    apparent_temperature: string;
    precipitation: string;
    precipitation_probability: string;
    pressure_msl: string;
    relative_humidity_2m: string;
    temperature_2m: string;
    time: string;
    visibility: string;
    weathercode: string;
    windgusts_10m: string;
}