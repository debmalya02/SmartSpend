import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RecurringService } from './recurring.service';

@Controller('recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Post()
  async createPlan(@Body() body: any) {
    return this.recurringService.createPlan(body);
  }

  @Get()
  async getPlans(@Query('userId') userId: string) {
    return this.recurringService.getPlans(userId);
  }
}
