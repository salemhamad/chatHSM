import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockProvider } from './providers/mock.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { ChatMessage, StreamOptions } from './providers/ai-provider.interface';
import { Observable, of } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { RagService } from '../knowledge/rag.service';
import { AnswerCacheService } from '../brain/answer-cache.service';
import { ModelRouterService } from '../brain/model-router.service';
import { MemoryService } from '../brain/memory.service';
import {
  detectMessageType,
  getResponsePolicy,
  createFinalSystemPrompt,
  buildMessages,
} from './ai-chat-engine';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private provider: GeminiProvider | MockProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mockProvider: MockProvider,
    private readonly geminiProvider: GeminiProvider,
    private readonly ragService: RagService,
    private readonly answerCacheService: AnswerCacheService,
    private readonly modelRouterService: ModelRouterService,
    private readonly memoryService: MemoryService,
  ) {
    this.provider = this.geminiProvider; // Switched to real Gemini API
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
    // 0. Route Task and Check Cache
    const { taskType, recommendedModelTier } = this.modelRouterService.routeMessage(messageContent);
    const cached = await this.answerCacheService.getCachedAnswer(messageContent);
    if (cached) {
      this.logger.debug(`Returning cached answer for message using model ${cached.modelName}`);
      return of(cached.answer);
    }

    // 1. Fetch previous messages in chronological order for conversation memory
    const previousMessages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20, // Send last 20 messages for context
    });

    // 2. Query RAG context and User Memory
    const [ragResult, memoryContext] = await Promise.all([
      this.ragService.retrieveContext(messageContent),
      this.memoryService.getMemoryContextForPrompt(userId)
    ]);

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
    
    const basePrompt = `أنت مساعد ذكي ومحترف يدعى ChatHSM.

القواعد الأساسية:
1. أجب على سؤال المستخدم مباشرة وبدون مقدمات طويلة أو حشو.
2. إذا كان السؤال يحتاج لإجابة بنعم أو لا، ابدأ إجابتك بـ "نعم" أو "لا".
3. لا تقم بتغيير الموضوع ولا تقدم معلومات لم يطلبها المستخدم.
4. لا تستخدم قوالب عامة مثل "النقاط الأساسية التفصيلية" إلا إذا طلب المستخدم شرحاً تفصيلياً.
5. يمنع منعاً باتاً إضافة رموز غريبة، أو كلمات غير مفهومة، أو هلوسة لغوية.
6. إذا طلب المستخدم بناء تطبيق، اشرح قدراتك بشكل مباشر (مثل تصميم الواجهة، برمجة الخادم، الذكاء الصناعي، إلخ) واسأله عن تفاصيل التطبيق.
7. استخدم لغة عربية سليمة وواضحة وطبيعية.`;

    // Detect message type and response policy
    const messageType = detectMessageType(messageContent);
    const responsePolicy = getResponsePolicy(messageType);

    let finalBasePrompt = basePrompt;

    if (memoryContext) {
      finalBasePrompt = `${finalBasePrompt}\n\n${memoryContext}`;
    }

    if (isStrict) {
      const contextSection = hasRagContext 
        ? `Here is the retrieved context from the Knowledge Base:\n${ragResult.context}\n\n`
        : '';

      finalBasePrompt = `${finalBasePrompt}

[STRICT CONTEXT RULE]
${contextSection}You are restricted strictly to the provided context. Answer the user's question based ONLY on this context. If the question is completely unrelated, refuse politely in English: "Sorry, I can only assist you with topics related to the content of this page."

[GREETINGS EXCEPTION]
If the user greets you or asks about your identity, bypass the context restriction. Respond warmly, politely, and briefly: "Welcome! I am your intelligent assistant ChatHSM, how can I help you today?"`;
    }

    if (isProOrVip) {
      const zeroLazinessPrompt = `[Zero-Laziness Protocol (Rule 31.31)]
You are STRICTLY FORBIDDEN from generating code snippets, placeholders, partial implementations, or comments like "// TODO" or "// implement here".
You MUST generate 100% complete, fully compiled, self-contained, clean, production-ready files.
You MUST write all code and related technical explanations exclusively in English.`;

      finalBasePrompt = `${zeroLazinessPrompt}\n\n${finalBasePrompt}`;
    }

    // Combine using the engine helper
    const systemPrompt = createFinalSystemPrompt(finalBasePrompt, responsePolicy);

    // Build the clean message list
    const formattedMessages = buildMessages({
      systemPrompt,
      history: previousMessages,
      currentUserMessage: messageContent,
    });

    const options: StreamOptions = { 
      webSearch,
      temperature: responsePolicy.temperature,
      strictContext: isStrict,
      messageType,
    };
    
    const stream = await this.provider.streamChat(formattedMessages, options);
    
    let fullAnswer = '';
    return stream.pipe(
      tap((chunk: string) => {
        // Accumulate chunks based on the structure (if string, just append. If JSON, parse and append content. Assume string for MockProvider)
        try {
          const parsed = JSON.parse(chunk);
          if (parsed.type === 'chunk' && parsed.content) {
            fullAnswer += parsed.content;
          }
        } catch(e) {
           // Not JSON, raw string
           fullAnswer += chunk;
        }
      }),
      finalize(() => {
        if (fullAnswer.length > 5 && !hasAttachments) {
           this.answerCacheService.cacheAnswer(messageContent, fullAnswer, recommendedModelTier).catch(e => this.logger.error('Failed to cache answer', e));
        }
      })
    );
  }
}
