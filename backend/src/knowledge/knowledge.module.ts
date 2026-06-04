import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { EmbeddingService } from './embedding.service';
import { RagService } from './rag.service';

@Module({
  controllers: [KnowledgeController],
  providers: [KnowledgeService, EmbeddingService, RagService],
  exports: [RagService, EmbeddingService],
})
export class KnowledgeModule {}
