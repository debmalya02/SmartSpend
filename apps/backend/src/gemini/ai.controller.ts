import { Body, Controller, Post } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('ai')
export class AiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('ask-affordability')
  async askAffordability(@Body() body: { userId: string; query: string }) {
    return this.geminiService.askAffordability(body.userId, body.query);
  }
}
