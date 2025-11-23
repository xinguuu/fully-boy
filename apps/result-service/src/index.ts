import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRateLimiter } from '@xingu/shared/middleware';
import { logger } from '@xingu/shared/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import resultRoutes from './routes/result.routes';
import { initSentry } from './config/sentry.config';
import * as Sentry from '@sentry/node';

const app = express();

// Initialize Sentry FIRST (before any middleware)
initSentry(app, 'result-service');

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());
app.use(apiRateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'Result Service is healthy!' });
});

app.use('/api/results', resultRoutes);

// Sentry error handler (must be before other error middleware)
Sentry.setupExpressErrorHandler(app);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 3006;

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    logger.info('Result Service started', { port });
  });
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received', { message: 'closing HTTP server' });
  await disconnectDatabase();
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received', { message: 'closing HTTP server' });
  await disconnectDatabase();
  await disconnectRedis();
  process.exit(0);
});

startServer().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
