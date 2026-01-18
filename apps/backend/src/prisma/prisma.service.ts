import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    
    // Ensure test user exists (for development only)
    const testUserId = 'test-user-id';
    const user = await this.user.findUnique({ where: { id: testUserId } });
    if (!user) {
      await this.user.create({
        data: {
          id: testUserId,
          phone: '+911234567890',
          name: 'Test Agent',
          currency: 'INR',
          isOnboarded: true,
        },
      });
      console.log(`Created test user: ${testUserId}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
