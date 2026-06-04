import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { MockProvider } from './providers/mock.provider';
import { MessagesModule } from '../messages/messages.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [MessagesModule, ConversationsModule, KnowledgeModule],
  controllers: [AiController],
  providers: [AiService, MockProvider],
  exports: [AiService],
})
export class AiModule {}

