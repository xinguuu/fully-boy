import * as Sentry from '@sentry/node';
import { httpIntegration, expressIntegration } from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry(_app: unknown, serviceName: string) {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      serverName: serviceName,
      release: process.env.SENTRY_RELEASE || 'development',
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
      integrations: [
        nodeProfilingIntegration(),
        httpIntegration(),
        expressIntegration(),
      ],
      beforeSend(event) {
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });

    Sentry.setTag('service', serviceName);
    console.log(`✅ Sentry initialized for ${serviceName}`);
    return true;
  }

  console.log(`ℹ️  Sentry not initialized (NODE_ENV=${process.env.NODE_ENV})`);
  return false;
}

export { Sentry };
