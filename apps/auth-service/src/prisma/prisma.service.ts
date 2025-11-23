import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DB_CONFIG } from '@xingu/shared';
import { logger } from '@xingu/shared/logger';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async onModuleInit() {
    const maxRetries = 10;
    const retryDelay = DB_CONFIG.RETRY_DELAY_MS;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        await this.$connect();
        logger.info('Prisma connected to database');
        return;
      } catch (error) {
        attempts++;
        logger.error('Database connection failed', {
          attempt: attempts,
          maxRetries,
          error: error instanceof Error ? error.message : error
        });

        if (attempts >= maxRetries) {
          logger.error('Max database connection retries reached', { message: 'Exiting' });
          process.exit(1);
        }

        logger.info('Retrying database connection', { delaySeconds: retryDelay / 1000 });
        await this.delay(retryDelay);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    logger.info('Prisma disconnected from database');
  }
}
