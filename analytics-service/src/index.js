import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database.js';

// Routes
import historyRoutes from './routes/history.js';
import statsRoutes from './routes/stats.js';
import trendsRoutes from './routes/trends.js';
import popularRoutes from './routes/popular.js';
import cleanupRoutes from './routes/cleanup.js';

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
connectDatabase();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analytics-service' });
});

// Routes
app.use('/history', historyRoutes);
app.use('/stats', statsRoutes);
app.use('/trends', trendsRoutes);
app.use('/popular', popularRoutes);
app.use('/cleanup', cleanupRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Analytics Service running on port ${PORT}`);
});
