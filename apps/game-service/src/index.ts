import express from 'express';
import cors from 'cors';
import { connectDatabase, disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import gameRoutes from './routes/game.routes';
import roomRoutes from './routes/room.routes';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'Game Service is healthy!' });
});

app.use('/games', gameRoutes);
app.use('/rooms', roomRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 3002;

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
