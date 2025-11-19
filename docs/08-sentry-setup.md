# Sentry Setup Guide

> Complete guide for setting up Sentry error tracking in Xingu

## Table of Contents

1. [Overview](#overview)
2. [Creating Sentry Projects](#creating-sentry-projects)
3. [Frontend Configuration](#frontend-configuration)
4. [Backend Services Configuration](#backend-services-configuration)
5. [Testing Sentry Integration](#testing-sentry-integration)
6. [Source Maps Upload](#source-maps-upload)
7. [Best Practices](#best-practices)

---

## Overview

Sentry provides real-time error tracking and monitoring for both frontend and backend applications. This guide walks through setting up Sentry for:

- **Frontend**: Next.js application (React)
- **Backend**: 6 NestJS microservices

---

## Creating Sentry Projects

### 1. Sign Up for Sentry

1. Go to [sentry.io](https://sentry.io)
2. Sign up for a free account (or use your existing account)
3. Create a new organization (if needed)

### 2. Create Projects

Create separate projects for better error isolation:

#### Frontend Project
- **Project Name**: `xingu-web`
- **Platform**: Next.js
- **Alert Frequency**: Real-time

#### Backend Projects (Optional: Can use one project for all services)
- **Project Name**: `xingu-backend` (or separate projects per service)
- **Platform**: Node.js
- **Alert Frequency**: Real-time

### 3. Get DSN Keys

For each project:
1. Go to **Settings** → **Projects** → [Your Project]
2. Click **Client Keys (DSN)**
3. Copy the DSN URL (format: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

---

## Frontend Configuration

### Files Already Configured

The frontend Sentry integration is already set up with these files:

```
apps/web/
├── sentry.client.config.ts    # Browser-side config
├── sentry.server.config.ts    # Server-side config
├── sentry.edge.config.ts      # Edge runtime config
├── instrumentation.ts         # Instrumentation loader
└── src/app/
    ├── error.tsx              # Page-level error boundary
    └── global-error.tsx       # Global error boundary
```

### Environment Variables

Add to `.env.production` (frontend):

```env
# Frontend Sentry DSN (publicly accessible - safe to expose)
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"

# Server-side Sentry DSN (kept private)
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"

# For source maps upload (optional)
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="xingu-web"
SENTRY_AUTH_TOKEN="your-auth-token"
```

### Test Frontend Integration

1. **Trigger a test error**:
   ```javascript
   // Add to any page temporarily
   throw new Error('Test Sentry Error');
   ```

2. **Build and run**:
   ```bash
   NODE_ENV=production pnpm build
   NODE_ENV=production pnpm start
   ```

3. **Check Sentry Dashboard**:
   - Go to your Sentry project
   - Navigate to **Issues**
   - You should see the test error appear within seconds

---

## Backend Services Configuration

### 1. Install Sentry for NestJS

For each backend service:

```bash
# Install Sentry package
pnpm add @sentry/node @sentry/profiling-node --filter=@xingu/auth-service
pnpm add @sentry/node @sentry/profiling-node --filter=@xingu/template-service
pnpm add @sentry/node @sentry/profiling-node --filter=@xingu/game-service
pnpm add @sentry/node @sentry/profiling-node --filter=@xingu/room-service
pnpm add @sentry/node @sentry/profiling-node --filter=@xingu/ws-service
pnpm add @sentry/node @sentry/profiling-node --filter=@xingu/result-service
```

### 2. Create Sentry Configuration

Create `src/config/sentry.config.ts` in each service:

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10% of transactions
      profilesSampleRate: 0.1, // 10% for profiling
      integrations: [
        new ProfilingIntegration(),
      ],
    });

    console.log('✅ Sentry initialized');
  }
}
```

### 3. Initialize in main.ts

Update `src/main.ts` for each service:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSentry } from './config/sentry.config';

async function bootstrap() {
  // Initialize Sentry FIRST
  initSentry();

  const app = await NestFactory.create(AppModule);

  // ... rest of your app configuration

  await app.listen(process.env.PORT || 3001);
}

bootstrap();
```

### 4. Create Global Exception Filter (Optional)

Create `src/filters/sentry-exception.filter.ts`:

```typescript
import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Capture exception in Sentry
    Sentry.captureException(exception);

    // Call parent exception handler
    super.catch(exception, host);
  }
}
```

Apply in `main.ts`:

```typescript
import { SentryExceptionFilter } from './filters/sentry-exception.filter';

async function bootstrap() {
  initSentry();

  const app = await NestFactory.create(AppModule);

  // Apply Sentry exception filter
  app.useGlobalFilters(new SentryExceptionFilter());

  await app.listen(process.env.PORT || 3001);
}
```

### 5. Environment Variables

Add to each service's `.env`:

```env
# Sentry DSN (backend)
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
```

---

## Testing Sentry Integration

### Frontend Test

```bash
# 1. Build production
cd apps/web
NODE_ENV=production pnpm build

# 2. Start production server
NODE_ENV=production pnpm start

# 3. Navigate to http://localhost:3000
# 4. Check browser console for Sentry initialization
# 5. Trigger an error (e.g., click a broken button)
# 6. Check Sentry dashboard
```

### Backend Test

```bash
# 1. Start a backend service with Sentry DSN
SENTRY_DSN="your-dsn" NODE_ENV=production pnpm --filter=@xingu/auth-service dev

# 2. Trigger an error via API
curl -X POST http://localhost:3001/api/auth/test-error

# 3. Check Sentry dashboard
```

### Verification Checklist

- [ ] Frontend errors appear in Sentry
- [ ] Backend errors appear in Sentry
- [ ] Error stack traces are readable
- [ ] User context is captured
- [ ] Environment (prod/dev) is correctly labeled
- [ ] Performance transactions are recorded

---

## Source Maps Upload

### Why Source Maps?

Source maps allow Sentry to show readable stack traces for minified production code.

### Setup for Next.js

1. **Install Sentry Webpack Plugin**:
   ```bash
   pnpm add @sentry/webpack-plugin --save-dev --filter=@xingu/web
   ```

2. **Update next.config.ts**:
   ```typescript
   import { withSentryConfig } from '@sentry/nextjs';

   const nextConfig = {
     // ... your existing config
   };

   const sentryWebpackPluginOptions = {
     silent: true, // Suppresses source map uploading logs
     org: process.env.SENTRY_ORG,
     project: process.env.SENTRY_PROJECT,
     authToken: process.env.SENTRY_AUTH_TOKEN,
   };

   export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
   ```

3. **Get Auth Token**:
   - Go to Sentry → **Settings** → **Account** → **API** → **Auth Tokens**
   - Create new token with `project:releases` scope
   - Add to `.env.production`

4. **Build with source maps**:
   ```bash
   SENTRY_ORG=your-org \
   SENTRY_PROJECT=xingu-web \
   SENTRY_AUTH_TOKEN=your-token \
   NODE_ENV=production \
   pnpm build
   ```

---

## Best Practices

### 1. Filter Sensitive Data

Configure Sentry to scrub sensitive information:

```typescript
// In sentry config
Sentry.init({
  // ...
  beforeSend(event, hint) {
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
```

### 2. Set User Context

Help identify users for better debugging:

```typescript
// Frontend (after login)
Sentry.setUser({
  id: user.id,
  username: user.username,
  email: user.email,
});

// Backend (in auth middleware)
Sentry.setUser({
  id: req.user.id,
  username: req.user.username,
});
```

### 3. Add Custom Context

```typescript
// Add custom tags
Sentry.setTag('feature', 'game-room');
Sentry.setTag('game-id', gameId);

// Add custom context
Sentry.setContext('game', {
  id: gameId,
  participants: count,
  status: 'active',
});
```

### 4. Performance Monitoring

```typescript
// Frontend - track specific operations
const transaction = Sentry.startTransaction({
  name: 'Game Load',
  op: 'game.load',
});

try {
  // Your code
  await loadGame();
} finally {
  transaction.finish();
}

// Backend - automatic HTTP request tracking
// Already handled by @sentry/node integrations
```

### 5. Release Tracking

Tag errors by release version:

```bash
# Set release in environment
export SENTRY_RELEASE=$(git rev-parse --short HEAD)

# Or in .env
SENTRY_RELEASE="xingu@1.0.0"
```

---

## Troubleshooting

### Errors Not Showing Up

1. **Check DSN**: Ensure `SENTRY_DSN` is correctly set
2. **Check Environment**: Sentry only enabled in production
3. **Check Network**: Ensure app can reach `sentry.io`
4. **Check Console**: Look for Sentry initialization errors

### Source Maps Not Working

1. **Verify Auth Token**: Check token has `project:releases` scope
2. **Check Upload**: Look for upload confirmation in build logs
3. **Verify Release**: Ensure release version matches

### Too Many Errors

1. **Adjust Sample Rate**: Lower `tracesSampleRate`
2. **Filter Noise**: Use `ignoreErrors` option
3. **Set Up Alerts**: Configure alert rules to avoid spam

---

## Monitoring & Alerts

### Set Up Alerts

1. Go to **Alerts** → **Create Alert**
2. Choose conditions:
   - Error frequency threshold
   - New issue detection
   - Regression detection
3. Set notification channels:
   - Email
   - Slack
   - PagerDuty

### Key Metrics to Monitor

- Error rate per service
- Error frequency by endpoint
- User-affected errors
- Performance degradation
- Crash-free sessions (frontend)

---

## Cost Management

### Free Tier Limits

- **Errors**: 5,000/month
- **Performance**: 10,000 transactions/month

### Optimization Tips

1. **Sample Traces**: Set `tracesSampleRate` to 0.1-0.2
2. **Filter Errors**: Use `beforeSend` to filter noise
3. **Adjust Alerts**: Avoid alert fatigue
4. **Archive Old Issues**: Keep dashboard clean

---

## Additional Resources

- **Sentry Next.js Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Sentry Node.js Docs**: https://docs.sentry.io/platforms/node/
- **Best Practices**: https://docs.sentry.io/product/sentry-basics/guides/
- **Performance Monitoring**: https://docs.sentry.io/product/performance/

---

**Last Updated**: 2025-11-19
