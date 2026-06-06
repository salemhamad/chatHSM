import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { AiModule } from './ai/ai.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { StorageModule } from './storage/storage.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { BrainModule } from './brain/brain.module';
import { TradingModule } from './trading/trading.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ConversationsModule,
    MessagesModule,
    AiModule,
    AttachmentsModule,
    StorageModule,
    KnowledgeModule,
    BrainModule,
    TradingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
