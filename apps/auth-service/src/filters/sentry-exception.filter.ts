import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Capture exception in Sentry
    const contextType = host.getType();

    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const request = ctx.getRequest();
      const user = request.user;

      // Set user context if available
      if (user) {
        Sentry.setUser({
          id: user.id || user.sub,
          username: user.username,
          email: user.email,
        });
      }

      // Add request context (sanitize sensitive data)
      const sanitizedBody = request.body
        ? {
            ...request.body,
            ...(request.body.password && { password: '[REDACTED]' }),
            ...(request.body.newPassword && { newPassword: '[REDACTED]' }),
            ...(request.body.refreshToken && { refreshToken: '[REDACTED]' }),
          }
        : undefined;

      Sentry.setContext('request', {
        method: request.method,
        url: request.url,
        body: sanitizedBody,
      });
    }

    // Capture the exception
    Sentry.captureException(exception);

    // Clear user context after capturing
    Sentry.setUser(null);

    // Call parent exception handler
    super.catch(exception, host);
  }
}
