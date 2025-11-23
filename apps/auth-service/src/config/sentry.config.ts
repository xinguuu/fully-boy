import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { logger } from '@xingu/shared/logger';

export function initSentry(serviceName: string) {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      serverName: serviceName,
      release: process.env.SENTRY_RELEASE || 'development',
      tracesSampleRate: 0.1, // 10% of transactions
      profilesSampleRate: 0.1, // 10% for profiling
      integrations: [nodeProfilingIntegration()],
      beforeSend(event) {
        // Remove sensitive data
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });

    Sentry.setTag('service', serviceName);
    logger.info('Sentry initialized', { serviceName });
  } else {
    logger.info('Sentry not initialized', { nodeEnv: process.env.NODE_ENV });
  }
}
