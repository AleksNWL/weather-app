import { WeatherHistory } from '../models/WeatherHistory.js';

/**
 * Добавить новую запись в историю
 */
export const addHistoryEntry = async (data) => {
  const entry = new WeatherHistory(data);
  return await entry.save();
};

/**
 * Получить историю с пагинацией
 */
export const getHistory = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const history = await WeatherHistory.find()
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await WeatherHistory.countDocuments();
  
  return {
    data: history,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Получить статистику по всем городам
 */
export const getCitiesStats = async () => {
  return await WeatherHistory.aggregate([
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
};

/**
 * Получить подробную статистику по конкретному городу
 */
export const getCityStats = async (city, days = 30) => {
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

  if (stats.length > 0 && stats[0].descriptions) {
    const descriptionCount = stats[0].descriptions.reduce((acc, desc) => {
      acc[desc] = (acc[desc] || 0) + 1;
      return acc;
    }, {});
    
    stats[0].mostCommonDescription = Object.entries(descriptionCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
  }

  return stats[0] || {};
};

/**
 * Получить тренды температуры по дням
 */
export const getCityTrends = async (city, days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await WeatherHistory.aggregate([
    {
      $match: {
        city: city,
        date: { $gte: startDate }
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
};

/**
 * Получить популярные города
 */
export const getPopularCities = async (limit = 5) => {
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
        city: { $arrayElemAt: ["$names", 0] },
        allNames: "$names",
        requests: 1,
        country: 1
      }
    },
    { $sort: { requests: -1 } },
    { $limit: limit }
  ]);
  
  return popular;
};

/**
 * Удалить старые записи
 */
export const deleteOldRecords = async (days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await WeatherHistory.deleteMany({
    date: { $lt: cutoffDate }
  });
  
  return result.deletedCount;
};

/**
 * Удалить записи с пустыми названиями городов
 */
export const deleteNullCities = async () => {
  const result = await WeatherHistory.deleteMany({
    $or: [
      { city: null },
      { city: { $exists: false } }
    ]
  });
  
  return result.deletedCount;
};

/**
 * Исправить записи с пустыми названиями городов
 */
export const fixNullCities = async () => {
  const nullCities = await WeatherHistory.find({ 
    $or: [
      { city: null },
      { city: { $exists: false } }
    ]
  });
  
  let updatedCount = 0;
  
  for (const record of nullCities) {
    if (record.originalQuery) {
      record.city = record.originalQuery;
      await record.save();
      updatedCount++;
    }
  }
  
  return updatedCount;
};
