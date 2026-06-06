import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async submitEvaluation(userId: string, question: string, answer: string, modelName: string, rating: 'positive' | 'negative', reason?: string, tags?: string) {
    const evaluation = await this.prisma.aiEvaluation.create({
      data: {
        userId,
        question,
        answer,
        modelName,
        rating,
        reason,
        tags,
      },
    });

    this.logger.debug(`Saved evaluation for user ${userId}: ${rating}`);

    // If positive, consider adding to TrainingExample
    if (rating === 'positive') {
      await this.prisma.trainingExample.create({
        data: {
          input: question,
          output: answer,
          taskType: 'qa', // could be dynamically mapped
          qualityScore: 1.0,
          approved: true,
          source: 'chat',
        },
      });
      this.logger.debug(`Promoted positive evaluation to TrainingExample`);
    }

    return evaluation;
  }
}
