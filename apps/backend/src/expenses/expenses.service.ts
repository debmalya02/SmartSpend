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
  ) { }

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

  async addMultipleExpensesViaAI(userId: string, text: string) {
    this.logger.log(`Processing multiple AI expenses for user ${userId}`);

    // 1. Get parsed data from Gemini
    const aiData = await this.geminiService.parseMultipleExpenses(text);
    this.logger.log(`AI Response: ${JSON.stringify(aiData)}`);

    if (!aiData.expenses || aiData.expenses.length === 0) {
      return { 
        transactions: [], 
        summary: aiData.summary || 'No transactions found in the transcript' 
      };
    }

    const createdTransactions: any[] = [];

    // 2. Process each expense
    for (const expense of aiData.expenses) {
      try {
        // Find or create category
        let category = await this.prisma.category.findUnique({
          where: { name: expense.category },
        });

        if (!category) {
          category = await this.prisma.category.create({
            data: {
              name: expense.category,
              icon: 'tag',
              color: '#cccccc',
            },
          });
        }

        // Create Transaction
        const transaction = await this.prisma.transaction.create({
          data: {
            amount: expense.amount,
            currency: expense.currency || 'INR',
            type: expense.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
            description: expense.description,
            merchant: expense.merchant,
            date: expense.date ? new Date(expense.date) : new Date(),
            isAiGenerated: true,
            confidenceScore: expense.confidenceScore || 0.9,
            category: { connect: { id: category.id } },
            user: { connect: { id: userId } },
          },
          include: { category: true },
        });

        createdTransactions.push(transaction);
      } catch (error) {
        this.logger.error(`Failed to create transaction for expense: ${JSON.stringify(expense)}`, error);
        // Continue with other expenses even if one fails
      }
    }

    return {
      transactions: createdTransactions,
      summary: `Successfully added ${createdTransactions.length} transaction(s)`,
      originalSummary: aiData.summary,
    };
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
  async createTransaction(userId: string, data: any) {
    const { amount, merchant, date, category, receiptUrl, description } = data;

    // 1. Find or create category
    let cat = await this.prisma.category.findUnique({
      where: { name: category },
    });

    if (!cat) {
      cat = await this.prisma.category.create({
        data: {
          name: category,
          icon: 'tag',
          color: '#cccccc',
        },
      });
    }

    // 3. Create Transaction
    return this.prisma.transaction.create({
      data: {
        amount,
        currency: data.currency || 'INR',
        merchant,
        date: new Date(date),
        description: description || `Receipt from ${merchant}`,
        type: 'EXPENSE',
        category: { connect: { id: cat.id } },
        user: { connect: { id: userId } },
        receipt: receiptUrl ? {
          create: {
            imageUrl: receiptUrl,
            user: { connect: { id: userId } }
          }
        } : undefined,
      },
      include: {
        category: true,
        receipt: true,
      },
    });
  }

  async deleteTransaction(userId: string, id: string) {
    return this.prisma.transaction.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}
