import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

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
    console.log(`✅ Sentry initialized for ${serviceName}`);
  } else {
    console.log(`ℹ️  Sentry not initialized (NODE_ENV=${process.env.NODE_ENV})`);
  }
}
