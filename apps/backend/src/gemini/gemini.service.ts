import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not defined');
      throw new Error('GEMINI_API_KEY is not defined');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async parseExpense(rawText: string): Promise<any> {
    const prompt = `
      Extract the following details from the expense text:
      - amount (number)
      - currency (string, specific 3-letter code, default to 'INR' if not specified or context implies India)
      - type (string, 'INCOME' or 'EXPENSE'. Default 'EXPENSE' if ambiguous. e.g. "Salary", "Received", "Bonus" -> INCOME)
      - description (string, the original text)
      - merchant (string, guessed from text. If income, source of income e.g. "Employer")
      - date (string, ISO 8601 format YYYY-MM-DD, default to today if not specified)
      - category (string, best guess category e.g., Food, Travel, Shopping, Utilities, Salary, Freelance, Other)
      - confidenceScore (number, 0-1)

      Context:
      - Current Date: ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD)

      Return ONLY a JSON object. No markdown formatting.
      Text: "${rawText}"
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up potential markdown code blocks
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      this.logger.error('Failed to parse expense with Gemini', error);
      throw error;
    }
  }

  async askAffordability(userId: string, query: string) {
    // 1. Calculate Monthly Income (This month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const incomeResult = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        date: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });
    const monthlyIncome = incomeResult._sum.amount?.toNumber() || 0;

    // 2. Calculate Total Fixed Expenses (Recurring Plans)
    const recurringResult = await this.prisma.recurringPlan.aggregate({
      where: { userId, isActive: true },
      _sum: { amount: true },
    });
    const fixedExpenses = recurringResult._sum.amount?.toNumber() || 0;

    // 3. Calculate Average Variable Spending (Last 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);
    
    const variableResult = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        recurringPlanId: null,
        date: { gte: sixtyDaysAgo },
      },
      _sum: { amount: true },
    });
    const totalVariable60Days = variableResult._sum.amount?.toNumber() || 0;
    const avgVariableExpenses = totalVariable60Days / 2; // Monthly average

    // 4. Calculate Surplus
    const surplus = monthlyIncome - fixedExpenses - avgVariableExpenses;

    // 5. Identify Top Spending Category
    const topCategoryResult = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startOfMonth },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 1,
    });
    
    let topCategoryName = 'General';
    if (topCategoryResult.length > 0 && topCategoryResult[0].categoryId) {
        const cat = await this.prisma.category.findUnique({ where: { id: topCategoryResult[0].categoryId }});
        if (cat) topCategoryName = cat.name;
    }

    // 6. Gemini Prompt
    const prompt = `
      User Financial Context:
      - Monthly Income: ${monthlyIncome}
      - Fixed Expenses (Bills/Subs): ${fixedExpenses}
      - Avg Variable Spending: ${avgVariableExpenses}
      - Current Monthly Surplus: ${surplus}
      - Top Expense Category: ${topCategoryName}
      
      User Query: "${query}"
      
      Task: Provide a friendly financial verdict based on the user's query and their financial stats.
      - If they ask if they can afford something, analyze the cost vs surplus.
      - If the query is vague, give general advice based on their stats.
      - Keep it short, encouraging, and emoji-friendly.
      - Return a JSON object with fields: { "verdict": "string", "advice": "string", "color": "green" | "yellow" | "red" }
      - NO MARKDOWN.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      this.logger.error('Affordability check failed', e);
      return { verdict: "Error", advice: "Could not analyze at this moment.", color: "gray" };
    }
  }
}
