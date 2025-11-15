import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRateLimiter } from '@xingu/shared/middleware';
import { connectDatabase, disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import gameRoutes from './routes/game.routes';

console.log('🔍 [DEBUG] JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES ✅' : 'NO ❌');
console.log('🔍 [DEBUG] DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES ✅' : 'NO ❌');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());
app.use(apiRateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'Game Service is healthy!' });
});

app.use('/api/games', gameRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 3003;

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`🚀 Game Service is running on: http://localhost:${port}`);
  });
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await disconnectDatabase();
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await disconnectDatabase();
  await disconnectRedis();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
