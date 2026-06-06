import { Module } from '@nestjs/common';
import { BrainController } from './brain.controller';
import { ModelRouterService } from './model-router.service';
import { AnswerCacheService } from './answer-cache.service';
import { MemoryService } from './memory.service';
import { EvaluationService } from './evaluation.service';

@Module({
  controllers: [BrainController],
  providers: [
    ModelRouterService,
    AnswerCacheService,
    MemoryService,
    EvaluationService,
  ],
  exports: [
    ModelRouterService,
    AnswerCacheService,
    MemoryService,
    EvaluationService,
  ],
})
export class BrainModule {}
