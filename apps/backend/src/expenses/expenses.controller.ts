import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post('ai-add')
  async addExpenseViaAI(@Body() body: { text: string; userId: string }) {
    return this.expensesService.addExpenseViaAI(body.userId, body.text);
  }

  @Get()
  async getExpenses(@Query('userId') userId: string) {
    return this.expensesService.getTransactions(userId);
  }
}
