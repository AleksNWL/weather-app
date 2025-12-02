export default function declineNameCity(city: string): string {
    const endings = [
        { from: "а", to: "е" },
        { from: "я", to: "е" },
        { from: "ь", to: "е" },
        { from: "к", to: "ке" },
        { from: "ск", to: "ске" },
        { from: "ий", to: "ии" },
        { from: "ой", to: "ом" },
        { from: "ок", to: "ке" },
    ];

    const lowerCity = city.toLowerCase();

    for (const { from, to } of endings) {
        if (lowerCity.endsWith(from)) {
            return city.slice(0, city.length - from.length) + to;
        }
    }

    return city;
}