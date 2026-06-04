import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockProvider } from './providers/mock.provider';
import { ChatMessage, StreamOptions } from './providers/ai-provider.interface';
import { Observable } from 'rxjs';
import { RagService } from '../knowledge/rag.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private provider: MockProvider; // Can easily be swapped with Gemini or OpenAI

  constructor(
    private readonly prisma: PrismaService,
    private readonly mockProvider: MockProvider,
    private readonly ragService: RagService,
  ) {
    this.provider = this.mockProvider;
  }

  async generateTitle(firstMessage: string): Promise<string> {
    return this.provider.generateTitle(firstMessage);
  }

  async streamChat(
    conversationId: string,
    userId: string,
    messageContent: string,
    attachmentIds: string[] = [],
    webSearch?: boolean,
  ): Promise<Observable<string>> {
    // 1. Fetch previous messages in chronological order for conversation memory
    const previousMessages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20, // Send last 20 messages for context
    });

    // 2. Query RAG context from the knowledge base
    const ragResult = await this.ragService.retrieveContext(messageContent);

    // Get the user's plan tier
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    const isProOrVip = user?.plan === 'PRO' || user?.plan === 'VIP';

    // 3. Format history for the AI provider and inject system instructions
    const hasAttachments = attachmentIds.length > 0;

    // Check if there are active knowledge base documents or facts
    const [enabledDocCount, factCount] = await Promise.all([
      this.prisma.document.count({ where: { isEnabled: true, status: 'PROCESSED' } }),
      this.prisma.directFact.count(),
    ]);
    const hasKnowledgeBase = enabledDocCount > 0 || factCount > 0;
    const isStrict = hasAttachments || hasKnowledgeBase;

    const hasRagContext = !!(ragResult && ragResult.isRelated && ragResult.context);
    
    let systemPrompt = `You are a highly precise and professional AI assistant. Your primary rule for answering is 'Balanced Precision'. When asked a question, provide a detailed and accurate answer, but keep it concise. Do not be overly brief, and absolutely do not be too long or wordy. Avoid unnecessary introductions, filler words, or repeating the user's question. Get straight to the point, structure your answer with bullet points if helpful, and deliver high-value information in the most efficient word count possible. Speak in the user's language smoothly.`;

    if (isStrict) {
      const contextSection = hasRagContext 
        ? `Here is the retrieved context from the Knowledge Base:\n${ragResult.context}\n\n`
        : '';

      systemPrompt = `${contextSection}You are an AI assistant restricted strictly to the provided context (the currently open page or document). You must answer the user's question based ONLY on this provided context. If the user asks a question that is completely unrelated to the provided context, you MUST NOT attempt to guess, hallucinate, or use general outside knowledge. Instead, you must politely refuse to answer by saying exactly: "عذراً، يمكنني مساعدتك فقط في المواضيع المتعلقة بمحتوى هذه الصفحة."

Identity and Greetings Rule: You are 'ChatHSM', an advanced AI assistant. If the user sends a standard greeting (e.g., 'مرحبا', 'كيف الحال', 'السلام عليكم') or asks about your identity (e.g., 'من أنت؟'), you MUST bypass the strict context rule. Respond warmly, politely, and extremely briefly in Arabic. For example, say: 'أهلاً بك! أنا مساعدك الذكي ChatHSM، كيف يمكنني مساعدتك اليوم؟'. Do not write long paragraphs for greetings.`;
    }

    if (isProOrVip) {
      const zeroLazinessPrompt = `[Zero-Laziness Protocol (Rule 31.31)]
You are STRICTLY FORBIDDEN from generating code snippets, placeholders, partial implementations, or comments like "// TODO" or "// implement here".
You MUST generate 100% complete, fully compiled, self-contained, clean, production-ready files.
You MUST write all code and related technical explanations exclusively in English to prevent character encoding issues and ensure stability.`;

      systemPrompt = `${zeroLazinessPrompt}\n\n${systemPrompt}`;
    }

    const formattedMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.map((msg) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
    ];

    // If the conversation is brand new, we might not have the user's current message in the DB yet,
    // but the controller handles inserting it before calling streamChat. Just in case, if the last
    // message isn't the current prompt (excluding system prompt at index 0), we append it.
    const isLastMessageCurrent =
      formattedMessages.length > 1 &&
      formattedMessages[formattedMessages.length - 1].content === messageContent;

    if (!isLastMessageCurrent) {
      formattedMessages.push({
        role: 'user',
        content: messageContent,
      });
    }

    // 4. Initiate the streaming observable from the provider
    const options: StreamOptions = { 
      webSearch,
      temperature: 0.5, // Balanced precision temperature (between 0.5 and 0.6)
      strictContext: isStrict,
    };
    return this.provider.streamChat(formattedMessages, options);
  }
}
