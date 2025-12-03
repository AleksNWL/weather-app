import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/weather";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Analytics Service connected to MongoDB"))
  .catch(err => console.error(err));

// Улучшенная схема с большим количеством данных
const WeatherHistorySchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  feels_like: Number,
  temp_min: Number,
  temp_max: Number,
  humidity: Number,
  pressure: Number,
  wind_speed: Number,
  wind_deg: Number,
  description: String,
  icon: String,
  country: String,
  coordinates: {
    lat: Number,
    lon: Number
  },
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

// API: получить всю историю с пагинацией
app.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const history = await WeatherHistory.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await WeatherHistory.countDocuments();
    
    res.json({
      data: history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: статистика по городам
app.get('/stats/cities', async (req, res) => {
  try {
    const stats = await WeatherHistory.aggregate([
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 },
          avgTemp: { $avg: "$temperature" },
          lastRequest: { $max: "$date" },
          firstRequest: { $min: "$date" }
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: подробная статистика по конкретному городу
app.get('/stats/city/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await WeatherHistory.aggregate([
      {
        $match: {
          city: city,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$city",
          avgTemp: { $avg: "$temperature" },
          maxTemp: { $max: "$temperature" },
          minTemp: { $min: "$temperature" },
          avgHumidity: { $avg: "$humidity" },
          avgPressure: { $avg: "$pressure" },
          avgWindSpeed: { $avg: "$wind_speed" },
          totalRequests: { $sum: 1 },
          descriptions: {
            $push: "$description"
          }
        }
      }
    ]);

    // Подсчитываем частоту описаний погоды
    if (stats.length > 0 && stats[0].descriptions) {
      const descriptionCount = stats[0].descriptions.reduce((acc, desc) => {
        acc[desc] = (acc[desc] || 0) + 1;
        return acc;
      }, {});
      
      stats[0].mostCommonDescription = Object.entries(descriptionCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
    }

    res.json(stats[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: тренды температуры по дням
app.get('/trends/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const days = parseInt(req.query.days) || 7;
    
    const trends = await WeatherHistory.aggregate([
      {
        $match: {
          city: city,
          date: { 
            $gte: new Date(new Date().setDate(new Date().getDate() - days))
          }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          },
          avgTemp: { $avg: "$temperature" },
          maxTemp: { $max: "$temperature" },
          minTemp: { $min: "$temperature" },
          date: { $first: "$date" }
        }
      },
      { $sort: { "date": 1 } }
    ]);

    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: популярные города
app.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const popular = await WeatherHistory.aggregate([
      {
        $match: {
          city: { $ne: null, $exists: true }
        }
      },
      {
        $group: {
          _id: {
            lat: "$coordinates.lat",
            lon: "$coordinates.lon"
          },
          names: { $addToSet: "$city" },
          requests: { $sum: 1 },
          country: { $first: "$country" }
        }
      },
      {
        $project: {
          city: { $arrayElemAt: ["$names", 0] }, // берем первое название
          allNames: "$names",
          requests: 1,
          country: 1
        }
      },
      { $sort: { requests: -1 } },
      { $limit: limit }
    ]);
    
    res.json(popular);
  } catch (err) {
    console.error('Popular cities error:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: очистка старых записей (опционально, для админки)
app.delete('/history/old', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await WeatherHistory.deleteMany({
      date: { $lt: cutoffDate }
    });
    
    res.json({
      message: `Deleted ${result.deletedCount} old records`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/cleanup/null-cities', async (req, res) => {
  try {
    const result = await WeatherHistory.deleteMany({
      $or: [
        { city: null },
        { city: { $exists: false } }
      ]
    });
    
    res.json({
      message: `Удалено ${result.deletedCount} записей с пустыми названиями городов`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/fix/null-cities', async (req, res) => {
  try {
    // Найти все записи где city = null
    const nullCities = await WeatherHistory.find({ 
      $or: [
        { city: null },
        { city: { $exists: false } }
      ]
    });
    
    let updatedCount = 0;
    
    // Если есть поле originalQuery, используем его
    for (const record of nullCities) {
      if (record.originalQuery) {
        record.city = record.originalQuery;
        await record.save();
        updatedCount++;
      }
    }
    
    res.json({
      message: `Обновлено ${updatedCount} записей`,
      updated: updatedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Analytics Service running on port ${PORT}`));