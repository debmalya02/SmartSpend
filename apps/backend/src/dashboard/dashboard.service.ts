import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. Total Income (This Month)
    const incomeResult = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });
    const income = incomeResult._sum.amount?.toNumber() || 0;

    // 2. Total Expense (This Month)
    const expenseResult = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });
    const expense = expenseResult._sum.amount?.toNumber() || 0;

    // 3. Savings Rate
    const savings = income - expense;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    return {
      income,
      expense,
      savings,
      savingsRate: Math.round(savingsRate * 10) / 10, // 1 decimal place
    };
  }
}
