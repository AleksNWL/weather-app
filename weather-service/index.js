import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
const PORT = 4001;
const API_KEY = process.env.OPENWEATHER_API_KEY;

app.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    res.json({
      city,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => console.log(`Weather service running on port ${PORT}`));
