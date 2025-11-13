import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function connectDatabase(maxRetries = 10, retryDelay = 5000) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      await prisma.$connect();
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
      await delay(retryDelay);
    }
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('✅ Prisma disconnected from database');
}