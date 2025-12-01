import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/weather";

// Подключаемся к MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("Analytics Service connected to MongoDB"))
  .catch(err => console.error(err));

// Схема для хранения истории запросов погоды
const WeatherHistorySchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  description: String,
  date: { type: Date, default: Date.now }
});

const WeatherHistory = mongoose.model("WeatherHistory", WeatherHistorySchema);

// API: добавление нового запроса
app.post('/history', async (req, res) => {
  try {
    const entry = new WeatherHistory(req.body);
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: получить всю историю
app.get('/history', async (req, res) => {
  try {
    const history = await WeatherHistory.find().sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: средняя температура по городу
app.get('/average/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const result = await WeatherHistory.aggregate([
      { $match: { city } },
      { $group: { _id: "$city", avgTemp: { $avg: "$temperature" } } }
    ]);
    res.json(result[0] || { city, avgTemp: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Analytics Service running on port ${PORT}`));
