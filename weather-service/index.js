const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json()); // на всякий случай для POST

const PORT = 4001;
const API_KEY = process.env.OPENWEATHER_API_KEY;

app.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    const weatherData = {
      city,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
    };

    // Отправляем данные в analytics-service
    try {
      await axios.post('http://analytics-service:4002/history', weatherData);
    } catch (analyticsError) {
      console.error('Failed to send data to analytics service:', analyticsError.message);
      // Не прерываем основной ответ пользователю
    }

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => console.log(`Weather service running on port ${PORT}`));
