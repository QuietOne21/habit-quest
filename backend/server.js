import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './src/routes/auth.routes.js';
import habitsRoutes from './src/routes/habits.routes.js';
import statsRoutes from './src/routes/stats.routes.js';

import errorHandler from './src/middleware/errorHandler.js';
import { globalLimiter } from './src/middleware/rateLimiter.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(globalLimiter);

app.set('trust proxy', 1);

app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost', // react dev server (when running locally)
        'http://localhost:80', // nginx (when running in docker)
    ],
    credentials: true,
}));

// health ckeck
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'habit-quest api',
    });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: `Cannot ${req.method} ${req.originalUrl}`,
        statusCode: 404,
    });
});

// errorHandler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`habit-quest api is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}/health`);
});

export default app;
