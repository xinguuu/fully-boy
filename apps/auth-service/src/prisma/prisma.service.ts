import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
    const retryDelay = 5000;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        await this.$connect();
        console.log('✅ Prisma connected to database');
        return;
      } catch (error) {
        attempts++;
        console.error(`❌ Database connection failed (attempt ${attempts}/${maxRetries}):`, error instanceof Error ? error.message : error);
        
        if (attempts >= maxRetries) {
          console.error('❌ Max database connection retries reached. Exiting...');
          process.exit(1);
        }
        
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        await this.delay(retryDelay);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('✅ Prisma disconnected from database');
  }
}
