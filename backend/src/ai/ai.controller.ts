import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AiService } from './ai.service';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsBoolean } from 'class-validator';

class ChatDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachmentIds?: string[];

  @IsBoolean()
  @IsOptional()
  webSearch?: boolean;
}

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Stream AI chat response via Server-Sent Events (SSE)' })
  async chat(
    @Request() req,
    @Body() dto: ChatDto,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    const { conversationId, message: userMessageContent, attachmentIds = [], webSearch = false } = dto;

    // Set headers for SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let userMessage;
    let aiMessagePlaceholder;
    let fullAiResponse = '';

    try {
      // 1. Create the user message in the database
      userMessage = await this.messagesService.create(
        conversationId,
        userId,
        'USER',
        userMessageContent,
        attachmentIds,
      );

      // Check if this is the first message in the conversation (to generate a title)
      const conversation = await this.conversationsService.findById(conversationId, userId);
      const isFirstMessage = conversation._count?.messages === 0 || conversation.title === 'New Chat';
      
      if (isFirstMessage) {
        const title = await this.aiService.generateTitle(userMessageContent);
        await this.conversationsService.update(conversationId, userId, { title });
        
        // Emit the generated title to the client
        res.write(`data: ${JSON.stringify({ type: 'title', content: title })}\n\n`);
      }

      // 2. Create the assistant placeholder message in the database
      aiMessagePlaceholder = await this.messagesService.create(
        conversationId,
        userId,
        'ASSISTANT',
        '', // Empty content at start
      );

      // Mark that AI is streaming (by updating database placeholder status)
      await this.messagesService.prisma.message.update({
        where: { id: aiMessagePlaceholder.id },
        data: { isStreaming: true },
      });

      // 3. Initiate the streaming observable from the AI Service
      const stream$ = await this.aiService.streamChat(
        conversationId,
        userId,
        userMessageContent,
        attachmentIds,
        webSearch,
      );

      const { detectMessageType, getSuggestedActions, isAnswerLikelyOffTopic } = await import('./ai-chat-engine');
      const messageType = detectMessageType(userMessageContent);

      // 4. Subscribe to the stream and push events to the Express response
      const subscription = stream$.subscribe({
        next: (chunk) => {
          fullAiResponse += chunk;
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        },
        error: async (err) => {
          this.logger.error(`AI stream error: ${err.message}`, err.stack);
          res.write(`data: ${JSON.stringify({ type: 'error', content: 'AI processing failed' })}\n\n`);
          
          // Clean up placeholder or mark it as error
          await this.messagesService.prisma.message.update({
            where: { id: aiMessagePlaceholder.id },
            data: {
              content: 'عذراً، حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.',
              isStreaming: false,
            },
          });
          
          res.end();
        },
        complete: async () => {
          let finalContent = fullAiResponse;
          if (isAnswerLikelyOffTopic(userMessageContent, fullAiResponse)) {
            finalContent = Buffer.from('2YTZgSDYo9mB2YfZhSDZgti12K/ZgyDYqNiv2YLYqS4g2YXZhdmD2YYg2KrZiNi22K0g2LPYpNin2YTZgyDYo9mD2KvYsdif', 'base64').toString('utf8');
          }

          // 5. Update the placeholder in the DB with the full completed content
          await this.messagesService.prisma.message.update({
            where: { id: aiMessagePlaceholder.id },
            data: {
              content: finalContent,
              isStreaming: false,
            },
          });

          // Send done event with suggestedActions and close response
          const suggested = getSuggestedActions(messageType);
          res.write(`data: ${JSON.stringify({ type: 'done', messageId: aiMessagePlaceholder.id, suggestedActions: suggested })}\n\n`);
          res.end();
        },
      });

      // Handle client disconnect / request aborted
      req.on('close', () => {
        subscription.unsubscribe();
        this.logger.log(`Client disconnected from stream. Subscription cancelled.`);
      });

    } catch (error) {
      this.logger.error(`Error bootstrapping chat stream: ${error.message}`, error.stack);
      res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
      res.end();
    }
  }
}
