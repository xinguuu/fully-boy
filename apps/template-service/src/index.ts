import express from 'express';
import cors from 'cors';
import { disconnectRedis } from './config/redis';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import templateRoutes from './routes/template.routes';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'Template Service is healthy!' });
});

app.use('/api/templates', templateRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 3002;

async function startServer() {
  app.listen(port, () => {
    console.log(`🚀 Template Service is running on: http://localhost:${port}`);
  });
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await disconnectRedis();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
