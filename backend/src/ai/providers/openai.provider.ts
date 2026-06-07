import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAiProvider, ChatMessage, StreamOptions } from './ai-provider.interface';
import { Observable } from 'rxjs';
import OpenAI from 'openai';

@Injectable()
export class OpenAIProvider implements IAiProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private openai: OpenAI;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk-your-openai-api-key') {
      this.openai = new OpenAI({ apiKey });
      this.isInitialized = true;
      this.logger.log('OpenAI Provider initialized');
    } else {
      this.logger.warn('OPENAI_API_KEY is missing or dummy. OpenAI provider will fail if called.');
      // Initialize with dummy key just to avoid crashing on boot
      this.openai = new OpenAI({ apiKey: 'dummy' });
    }
  }

  async generateTitle(firstMessage: string): Promise<string> {
    if (!this.isInitialized) return 'New Chat';
    
    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('AI_MODEL') || 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Generate a short, concise title (max 5 words) for a chat based on the first user message. Do not use quotes.' },
          { role: 'user', content: firstMessage }
        ],
        temperature: 0.5,
        max_tokens: 15,
      });
      return response.choices[0]?.message?.content?.trim() || 'New Chat';
    } catch (e) {
      this.logger.error('Failed to generate title', e);
      return 'New Chat';
    }
  }

  streamChat(messages: ChatMessage[], options?: StreamOptions): Observable<string> {
    if (!this.isInitialized) {
      this.logger.warn('Attempted to use OpenAI provider without a valid API key');
    }

    const modelName = this.configService.get<string>('AI_MODEL') || 'gpt-4o';
    
    // Map roles: 'SYSTEM', 'USER', 'ASSISTANT' to 'system', 'user', 'assistant'
    const openAiMessages = messages.map(msg => ({
      role: msg.role.toLowerCase() as 'system' | 'user' | 'assistant',
      content: msg.content
    }));

    return new Observable<string>((observer) => {
      let isCompleted = false;

      const executeStream = async () => {
        try {
          const stream = await this.openai.chat.completions.create({
            model: modelName,
            messages: openAiMessages as any,
            stream: true,
            temperature: 0.7,
            max_tokens: 4000,
          });

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              observer.next(content);
            }
          }

          if (!isCompleted) {
            observer.complete();
            isCompleted = true;
          }
        } catch (error) {
          this.logger.error('Error during OpenAI stream', error);
          if (!isCompleted) {
            observer.error(error);
          }
        }
      };

      executeStream();

      return () => {
        isCompleted = true;
      };
    });
  }
}
