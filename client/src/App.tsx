import { useState } from 'react';

const API_URL = "http://localhost:4000/graphql";

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState<any>(null);

  const fetchWeather = async () => {
    const query = `
      query {
        getWeather(city: "${city}") {
          city
          temperature
          description
        }
      }`;
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const result = await res.json();
    setData(result.data.getWeather);
  };

  return (
    <div className="app" style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Weather App</h1>
      <input
        type="text"
        placeholder="Введите город"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={fetchWeather}>Показать</button>

      {data && (
        <div>
          <h2>{data.city}</h2>
          <p>{data.temperature} °C</p>
          <p>{data.description}</p>
        </div>
      )}
    </div>
  );
}

export default App;
