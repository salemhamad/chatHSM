import { Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamOptions {
  webSearch?: boolean;
  temperature?: number;
  strictContext?: boolean;
}

export interface IAiProvider {
  streamChat(
    messages: ChatMessage[],
    options?: StreamOptions,
  ): Observable<string>;
  
  generateTitle(firstMessage: string): Promise<string>;
}
