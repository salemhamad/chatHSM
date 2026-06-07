import { Injectable, Logger } from '@nestjs/common';
import { Observable, Observer } from 'rxjs';
import { IAiProvider, ChatMessage, StreamOptions } from './ai-provider.interface';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiProvider implements IAiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || 'dummy-key';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  streamChat(messages: ChatMessage[], options?: StreamOptions): Observable<string> {
    return new Observable((observer: Observer<string>) => {
      this.executeStream(messages, options, observer).catch((err) => {
        this.logger.error('Gemini stream error', err);
        observer.error(err);
      });
    });
  }

  private async executeStream(messages: ChatMessage[], options: StreamOptions | undefined, observer: Observer<string>) {
    // Extract system instructions if any (usually first message if role === 'system')
    const systemMessages = messages.filter(m => m.role === 'system');
    let systemInstruction = undefined;
    if (systemMessages.length > 0) {
      systemInstruction = systemMessages.map(m => m.content).join('\n\n');
    }

    // Filter out system messages for history
    const historyMessages = messages.filter(m => m.role !== 'system');
    
    // The last message is the current user prompt
    const userPrompt = historyMessages.pop()?.content || '';

    // Map history to Gemini format
    const rawHistory = historyMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Enforce alternating roles starting with 'user'
    const history: { role: string, parts: { text: string }[] }[] = [];
    for (const msg of rawHistory) {
      if (history.length === 0) {
        if (msg.role === 'user') {
          history.push(msg);
        }
      } else {
        const lastMsg = history[history.length - 1];
        if (lastMsg.role !== msg.role) {
          history.push(msg);
        } else {
          // Combine consecutive messages of the same role
          lastMsg.parts[0].text += '\n\n' + msg.parts[0].text;
        }
      }
    }

    // History must end with 'model' because the next message is 'user' (userPrompt)
    if (history.length > 0 && history[history.length - 1].role === 'user') {
      history.pop();
    }

    // Select model based on options (Model Router output can be injected via messageType/options)
    // Default to flash, pro for coding
    let modelName = 'gemini-1.5-flash-latest';
    if (options?.messageType === 'coding' || options?.messageType === 'deepResearch' || options?.messageType === 'large_model_or_external') {
      modelName = 'gemini-1.5-pro-latest';
    }

    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
    });

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
      },
    });

    try {
      const result = await chat.sendMessageStream(userPrompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          observer.next(chunkText);
        }
      }
      
      observer.complete();
    } catch (error) {
      this.logger.error('Error during Gemini stream', error);
      observer.error(error);
    }
  }

  async generateTitle(firstMessage: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      const prompt = `Generate a very short, concise title (max 4-5 words) for the following chat message. Do not include quotes or extra text, just the title.\n\nMessage: ${firstMessage}`;
      const result = await model.generateContent(prompt);
      return result.response.text().trim() || 'New Chat';
    } catch (error) {
      this.logger.error('Failed to generate title', error);
      // Fallback
      const isArabic = /[\u0600-\u06FF]/.test(firstMessage);
      const words = firstMessage.split(' ').slice(0, 4).join(' ');
      return isArabic ? `محادثة: ${words}...` : `Chat: ${words}...`;
    }
  }
}
