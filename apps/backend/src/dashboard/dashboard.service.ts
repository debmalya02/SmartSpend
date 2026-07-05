import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

    // 1. Total Income & Expense (This Month)
    const incomeResult = await this.prisma.transaction.aggregate({
      where: { userId, type: 'INCOME', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    });
    const income = incomeResult._sum.amount?.toNumber() || 0;

    const expenseResult = await this.prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    });
    const expense = expenseResult._sum.amount?.toNumber() || 0;

    const netBalance = income - expense;

    // 2. Today's and Yesterday's Expense (excluding recurring plans)
    const todayResult = await this.prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: todayStart, lte: todayEnd }, recurringPlanId: null },
      _sum: { amount: true },
    });
    const todaySpend = todayResult._sum.amount?.toNumber() || 0;

    const yesterdayResult = await this.prisma.transaction.aggregate({
      where: { userId, type: 'EXPENSE', date: { gte: yesterdayStart, lte: yesterdayEnd }, recurringPlanId: null },
      _sum: { amount: true },
    });
    const yesterdaySpend = yesterdayResult._sum.amount?.toNumber() || 0;

    let percentageChange = 0;
    if (yesterdaySpend > 0) {
      percentageChange = ((todaySpend - yesterdaySpend) / yesterdaySpend) * 100;
    } else if (todaySpend > 0) {
      percentageChange = 100;
    }
    percentageChange = Math.round(percentageChange * 10) / 10;

    // 3. Weekly Report & Monthly Extremes (excluding recurring plans)
    const monthExpenses = await this.prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE', date: { gte: startOfMonth, lte: endOfMonth }, recurringPlanId: null },
      select: { date: true, amount: true },
    });

    const dailyMap = new Map<string, number>();
    monthExpenses.forEach(tx => {
      // Convert to local date string for grouping
      const d = new Date(tx.date);
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const amount = tx.amount.toNumber();
      dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + amount);
    });

    let highestSpend = -1;
    let lowestSpend = Infinity;
    let highestDay = null;
    let lowestDay = null;

    dailyMap.forEach((amount, date) => {
      if (amount > highestSpend) {
        highestSpend = amount;
        highestDay = date;
      }
      if (amount > 0 && amount < lowestSpend) {
        lowestSpend = amount;
        lowestDay = date;
      }
    });

    const weeklyReport = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      weeklyReport.push({
        day: days[d.getDay()],
        date: dayKey,
        amount: dailyMap.get(dayKey) || 0,
      });
    }

    return {
      income,
      expense,
      netBalance,
      daily: {
        today: todaySpend,
        yesterday: yesterdaySpend,
        percentageChange,
      },
      monthlyExtremes: {
        highest: highestDay ? { date: highestDay, amount: highestSpend } : null,
        lowest: lowestDay && lowestSpend !== Infinity ? { date: lowestDay, amount: lowestSpend } : null,
      },
      weeklyReport,
    };
  }
}
