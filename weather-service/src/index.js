import express from 'express';
import cors from 'cors';

// Routes
import weatherRoutes from './routes/weather.js';
import forecastRoutes from './routes/forecast.js';
import searchRoutes from './routes/search.js';
import geocodeRoutes from './routes/geocode.js';

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'weather-service' });
});

// Routes
app.use('/weather', weatherRoutes);
app.use('/forecast', forecastRoutes);
app.use('/search', searchRoutes);
app.use('/geocode', geocodeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Weather Service running on port ${PORT}`);
});
