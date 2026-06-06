import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { MockProvider } from './providers/mock.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { MessagesModule } from '../messages/messages.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { BrainModule } from '../brain/brain.module';

@Module({
  imports: [MessagesModule, ConversationsModule, KnowledgeModule, BrainModule],
  controllers: [AiController],
  providers: [AiService, MockProvider, GeminiProvider],
  exports: [AiService],
})
export class AiModule {}

