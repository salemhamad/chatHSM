import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AnswerCacheService {
  private readonly logger = new Logger(AnswerCacheService.name);

  constructor(private readonly prisma: PrismaService) {}

  private hashQuestion(question: string): string {
    return crypto.createHash('sha256').update(question.trim().toLowerCase()).digest('hex');
  }

  async getCachedAnswer(question: string): Promise<{ answer: string; modelName: string } | null> {
    const hash = this.hashQuestion(question);
    
    const cached = await this.prisma.aiAnswerCache.findUnique({
      where: { questionHash: hash },
    });

    if (!cached) {
      return null;
    }

    // Check expiration
    if (cached.expiresAt && cached.expiresAt < new Date()) {
      this.logger.debug(`Cache expired for question: ${question}`);
      await this.prisma.aiAnswerCache.delete({ where: { id: cached.id } });
      return null;
    }

    // Increment hit count
    await this.prisma.aiAnswerCache.update({
      where: { id: cached.id },
      data: { hitCount: { increment: 1 } },
    });

    this.logger.debug(`Cache hit for question: ${question}`);
    return {
      answer: cached.answer,
      modelName: cached.modelName,
    };
  }

  async cacheAnswer(question: string, answer: string, modelName: string, ttlDays: number = 30): Promise<void> {
    const hash = this.hashQuestion(question);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    await this.prisma.aiAnswerCache.upsert({
      where: { questionHash: hash },
      update: {
        answer,
        modelName,
        expiresAt,
        hitCount: 0,
      },
      create: {
        questionHash: hash,
        question: question.trim(),
        answer,
        modelName,
        expiresAt,
      },
    });

    this.logger.debug(`Cached answer for question: ${question}`);
  }
}
