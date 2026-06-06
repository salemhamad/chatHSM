import { Controller, Post, Body, UseGuards, Req, Delete, Param, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MemoryService } from './memory.service';
import { EvaluationService } from './evaluation.service';

@Controller('brain')
@UseGuards(JwtAuthGuard)
export class BrainController {
  constructor(
    private readonly memoryService: MemoryService,
    private readonly evaluationService: EvaluationService,
  ) {}

  @Post('memory')
  async saveMemory(@Req() req, @Body() body: { category: string; key: string; value: string; confidence?: number }) {
    return this.memoryService.saveMemory(req.user.userId, body.category, body.key, body.value, body.confidence);
  }

  @Get('memory')
  async getMemories(@Req() req) {
    return this.memoryService.getUserMemories(req.user.userId);
  }

  @Delete('memory/:id')
  async forgetMemory(@Req() req, @Param('id') id: string) {
    await this.memoryService.forgetMemory(req.user.userId, id);
    return { success: true };
  }

  @Post('evaluation')
  async submitEvaluation(@Req() req, @Body() body: { question: string; answer: string; modelName: string; rating: 'positive' | 'negative'; reason?: string }) {
    return this.evaluationService.submitEvaluation(req.user.userId, body.question, body.answer, body.modelName, body.rating, body.reason);
  }
}
