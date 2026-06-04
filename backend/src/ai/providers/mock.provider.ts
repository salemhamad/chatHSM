import { Injectable, Logger } from '@nestjs/common';
import { Observable, Observer } from 'rxjs';
import { IAiProvider, ChatMessage, StreamOptions } from './ai-provider.interface';

@Injectable()
export class MockProvider implements IAiProvider {
  private readonly logger = new Logger(MockProvider.name);

  streamChat(messages: ChatMessage[], options?: StreamOptions): Observable<string> {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    
    const isArabic = /[\u0600-\u06FF]/.test(lastUserMessage);
    let textToStream = '';

    const queryLower = lastUserMessage.toLowerCase();
    const isGreetingOrIdentity = 
      queryLower.includes('مرحبا') || 
      queryLower.includes('سلام') || 
      queryLower.includes('كيف الحال') || 
      queryLower.includes('من أنت') ||
      queryLower.includes('من انت') ||
      queryLower.includes('hello') ||
      queryLower.includes('hi') ||
      queryLower.includes('who are you') ||
      queryLower === 'chathsm' ||
      queryLower.includes('who is chathsm') ||
      queryLower.includes('من هو chathsm');

    const hasZeroLaziness = messages.some(
      m => m.role === 'system' && m.content.includes('Zero-Laziness Protocol')
    );

    if (isGreetingOrIdentity) {
      textToStream = isArabic 
        ? `أهلاً بك! أنا مساعدك الذكي ChatHSM، كيف يمكنني مساعدتك اليوم؟`
        : `Hello! I am your intelligent assistant ChatHSM, how can I help you today?`;
    } else if (hasZeroLaziness) {
      textToStream = `/**
 * @fileoverview Safe JSON Storage Helper Module.
 * Implements type-safe LocalStorage wrapping with compression option and error boundaries.
 * 100% complete, fully implemented, ready for production use.
 * Under Zero-Laziness Protocol (Rule 31.31).
 */

export interface StorageOptions {
  compress?: boolean;
  namespace?: string;
}

export class SafeStorage {
  private readonly namespace: string;
  private readonly compress: boolean;

  constructor(options: StorageOptions = {}) {
    this.namespace = options.namespace || 'chathsm';
    this.compress = options.compress || false;
  }

  private getKey(key: string): string {
    return \`\${this.namespace}:\${key}\`;
  }

  public set<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      const payload = this.compress ? this.simpleB64Compress(serialized) : serialized;
      localStorage.setItem(this.getKey(key), payload);
      return true;
    } catch (error) {
      console.error(\`[SafeStorage] Set item error for key "\${key}":\`, error);
      return false;
    }
  }

  public get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;
      const decompressed = this.compress ? this.simpleB64Decompress(raw) : raw;
      return JSON.parse(decompressed) as T;
    } catch (error) {
      console.error(\`[SafeStorage] Get item error for key "\${key}":\`, error);
      return null;
    }
  }

  public remove(key: string): boolean {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(\`[SafeStorage] Remove item error for key "\${key}":\`, error);
      return false;
    }
  }

  public clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const rawKey = localStorage.key(i);
        if (rawKey && rawKey.startsWith(this.namespace + ':')) {
          keysToRemove.push(rawKey);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (error) {
      console.error('[SafeStorage] Clear namespace storage error:', error);
    }
  }

  private simpleB64Compress(str: string): string {
    return btoa(encodeURIComponent(str));
  }

  private simpleB64Decompress(str: string): string {
    return decodeURIComponent(atob(str));
  }
}`;
    } else if (options?.strictContext) {
      const hasRAGContext = messages.some(
        m => m.role === 'system' && m.content.includes('retrieved context')
      );
      const isRelated = 
        hasRAGContext ||
        queryLower.includes('ملف') || 
        queryLower.includes('صفحة') || 
        queryLower.includes('محتوى') || 
        queryLower.includes('سياق') ||
        queryLower.includes('file') || 
        queryLower.includes('page') || 
        queryLower.includes('context') || 
        queryLower.includes('document') || 
        queryLower.includes('read') || 
        queryLower.includes('summarize') ||
        queryLower.includes('لخص') ||
        queryLower.includes('اقرأ') ||
        queryLower.includes('تحليل') ||
        queryLower.includes('تقرير') ||
        queryLower.includes('analysis') ||
        queryLower.includes('report');

      if (!isRelated) {
        textToStream = isArabic 
          ? `عذراً، يمكنني مساعدتك فقط في المواضيع المتعلقة بمحتوى هذه الصفحة.`
          : `Sorry, I can only assist you with topics related to the content of this page.`;
      } else {
        textToStream = isArabic
          ? `إليك الإجابة المبنية حصرياً على السياق المتاح في المستند المرفق:

### تحليل محتوى الصفحة/المستند:
- **الملخص العام:** تم تحليل الملف بنجاح وتلخيص النقاط الرئيسية فيه.
- **النتائج المهمة:** يحتوي المستند على تقارير تفصيلية تتوافق مع سؤالك.
- **التوصيات:** يوصى باتباع الخطوات الواردة في الصفحة لتحقيق النتائج المرجوة.`
          : `Here is the response based strictly on the provided context of the attached document:

### Document Context Analysis:
- **General Summary:** The document has been successfully processed, extracting the core concepts.
- **Key Details:** Found relevant information in the text that directly addresses your query.
- **Recommendations:** It is advised to follow the procedures listed in the page to achieve the best results.`;
      }
    } else if (options?.webSearch) {
      if (isArabic) {
        textToStream = `🔍 **نتائج البحث لـ "${lastUserMessage}":**

### معلومات سريعة ومحدثة:
- **الموضوع الرئيسي:** الإجابة المباشرة على استفسارك.
- **التفاصيل المهمة:** معلومات مجمعة من مصادر موثوقة لعام 2026.
- **الخلاصة الدقيقة:** هذا الرد متوازن ومباشر من غير إطالة أو اختصار مخل.`;
      } else {
        textToStream = `🔍 **Search results for "${lastUserMessage}":**

### Instant Web Insights:
- **Core Subject:** Direct and balanced answer matching your query.
- **Key Details:** Compiled data points from top sources updated for 2026.
- **Balanced Summary:** Delivered efficiently without fluff or redundant introductions.`;
      }
    } else if (isArabic) {
      if (lastUserMessage.toLowerCase().includes('مرحبا') || lastUserMessage.toLowerCase().includes('سلام')) {
        textToStream = `أهلاً بك! أنا **مساعدك الذكي**. 

### كيف يمكنني خدمتك اليوم؟
- **دقة متوازنة:** سأجيبك بدقة وإيجاز غير مخل.
- **مباشر وموثوق:** سأعطيك زبدة الكلام مباشرة دون مقدمات مكررة.`;
      } else if (lastUserMessage.toLowerCase().includes('قصة')) {
        textToStream = `إليك قصة قصيرة ومعبرة:

### بئر الحكمة
عاش أهل قرية صغيرة بين الجبال في سلام. كان لديهم بئر ماء فريد يمنح كل من يشرب منه الحكمة ورؤية الجانب الإيجابي. 
ذات يوم، زار القرية غريب يبحث عن السعادة، فشرب من البئر وأدرك أن السعادة لا تُبحث عنها بالخارج بل تنبع من طريقة رؤيتنا للأشياء.`;
      } else {
        textToStream = `بناءً على طلبك الإجابة على استفسارك حول **"${lastUserMessage}"**:

### النقاط الأساسية بالتفصيل:
- **المعنى والمفهوم:** شرح دقيق ومباشر للنقطة المطلوبة بكفاءة عالية في عدد الكلمات.
- **الأهمية والفائدة:** تقديم قيمة حقيقية تناسب السياق ومكتوبة بسلاسة تامة.
- **الهيكل المنظم:** رد مقسم لعناصر مريحة للعين باستخدام لغة واضحة ومركزة.`;
      }
    } else {
      if (lastUserMessage.toLowerCase().includes('hello') || lastUserMessage.toLowerCase().includes('hi')) {
        textToStream = `Hello there! I am your **AI Assistant**.

### Quick Highlights of my rule:
- **Balanced Precision:** I provide concise, detailed, and direct responses.
- **Efficient Delivery:** Skipping introductions and getting straight to the value.`;
      } else if (lastUserMessage.toLowerCase().includes('story') || lastUserMessage.toLowerCase().includes('tale')) {
        textToStream = `Here is a brief, inspiring story:

### The Music of Time
In a quiet valley, a young clockmaker crafted clocks that played melodies reflecting the current weather. 
A traveler came seeking a clock that could predict the future. The clockmaker replied: "My clocks only capture the beauty of the present moment, which is the only time we truly have."`;
      } else {
        textToStream = `Here is the direct analysis of your prompt **"${lastUserMessage}"**:

### Key Insights:
- **Core Concept:** Detailed, accurate explanation optimized for efficiency.
- **Practical Application:** Clear value points structured logically for easy reading.
- **Concise Structure:** Structured with bullet points to deliver maximal context with minimal fluff.`;
      }
    }

    return new Observable((observer: Observer<string>) => {
      const words = textToStream.split(' ');
      let currentWordIndex = 0;

      const intervalId = setInterval(() => {
        if (currentWordIndex < words.length) {
          const chunk = words[currentWordIndex] + (currentWordIndex === words.length - 1 ? '' : ' ');
          observer.next(chunk);
          currentWordIndex++;
        } else {
          clearInterval(intervalId);
          observer.complete();
        }
      }, 50); // Emit a word every 50ms for realistic pacing

      return () => {
        clearInterval(intervalId);
      };
    });
  }

  async generateTitle(firstMessage: string): Promise<string> {
    const isArabic = /[\u0600-\u06FF]/.test(firstMessage);
    const words = firstMessage.split(' ').slice(0, 4).join(' ');
    
    if (isArabic) {
      return `محادثة: ${words || 'جديدة'}...`;
    } else {
      return `Chat: ${words || 'New'}...`;
    }
  }
}
