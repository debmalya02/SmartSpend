import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  async addExpenseViaAI(userId: string, text: string) {
    this.logger.log(`Processing AI expense for user ${userId}: ${text}`);
    
    // 1. Get parsed data from Gemini
    const aiData = await this.geminiService.parseExpense(text);
    this.logger.log(`AI Response: ${JSON.stringify(aiData)}`);

    // 2. Find or create category
    let category = await this.prisma.category.findUnique({
      where: { name: aiData.category },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: {
          name: aiData.category,
          // Default icon/color could be enhanced later
          icon: 'help-circle', 
          color: '#cccccc',
        },
      });
    }

    // 3. Create Transaction (was Expense)
    // Ensure amount is handled correctly (Gemini returns number, Prisma expects Decimal)
    const transactionData = {
      amount: aiData.amount,
      currency: aiData.currency || 'INR',
      type: (aiData.type === 'INCOME' ? 'INCOME' : 'EXPENSE') as 'INCOME' | 'EXPENSE',
      description: aiData.description,
      merchant: aiData.merchant,
      date: aiData.date ? new Date(aiData.date) : new Date(),
      isAiGenerated: true,
      confidenceScore: aiData.confidenceScore || 0.9,
      category: {
        connect: { id: category.id },
      },
      user: {
        connect: { id: userId },
      },
    };

    const transaction = await this.prisma.transaction.create({
      data: transactionData,
      include: {
        category: true,
      },
    });

    return transaction;
  }

  async getTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        category: true,
      },
    });
  }
}
