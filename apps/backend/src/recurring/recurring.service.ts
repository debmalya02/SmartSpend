import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringPlans() {
    this.logger.log('Checking for recurring plans due today...');

    const now = new Date();
    const plans = await this.prisma.recurringPlan.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: now,
        },
      },
      include: {
        user: true,
      }
    });

    this.logger.log(`Found ${plans.length} plans to process.`);

    for (const plan of plans) {
      try {
        await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          // 1. Create the transaction
          await tx.transaction.create({
            data: {
              amount: plan.amount,
              currency: plan.currency,
              type: plan.type, 
              description: `Recurring: ${plan.name}`,
              date: now,
              isAiGenerated: false,
              userId: plan.userId,
              recurringPlanId: plan.id,
              // We could link category if we added categoryId to RecurringPlan, but for now leave blank or default
            },
          });

          // 2. Calculate next due date
          const nextDate = new Date(plan.nextDueDate);
          if (plan.frequency === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
          } else if (plan.frequency === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
          } else if (plan.frequency === 'yearly') {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
          }

          // 3. Update the plan
          await tx.recurringPlan.update({
            where: { id: plan.id },
            data: { nextDueDate: nextDate },
          });
        });
        
        this.logger.log(`Processed plan ${plan.name} for user ${plan.userId}`);
      } catch (error) {
        this.logger.error(`Failed to process plan ${plan.id}: ${error.message}`);
      }
    }
  }
  async createPlan(data: {
    name: string;
    amount: number;
    currency: string;
    frequency: string;
    type: 'INCOME' | 'EXPENSE';
    userId: string;
  }) {
    const now = new Date();
    const nextDate = new Date();
    
    // Default nextDueDate to NOW + Frequency
    if (data.frequency === 'monthly') nextDate.setMonth(now.getMonth() + 1);
    else if (data.frequency === 'weekly') nextDate.setDate(now.getDate() + 7);
    else if (data.frequency === 'yearly') nextDate.setFullYear(now.getFullYear() + 1);

    const plan = await this.prisma.recurringPlan.create({
      data: {
        name: data.name,
        amount: data.amount,
        currency: data.currency || 'INR',
        frequency: data.frequency,
        type: data.type,
        nextDueDate: nextDate,
        userId: data.userId,
      },
    });

    // Create the first transaction IMMEDIATELY so it shows in the Dashboard
    await this.prisma.transaction.create({
      data: {
        amount: data.amount,
        currency: data.currency || 'INR',
        type: data.type,
        description: `Recurring (Initial): ${data.name}`,
        date: now,
        isAiGenerated: false,
        userId: data.userId,
        recurringPlanId: plan.id,
      },
    });

    return plan;
  }

  async getPlans(userId: string) {
    return this.prisma.recurringPlan.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
