import { Injectable, Logger } from '@nestjs/common';
import { Observable, Observer } from 'rxjs';
import { IAiProvider, ChatMessage, StreamOptions } from './ai-provider.interface';

@Injectable()
export class MockProvider implements IAiProvider {
  private readonly logger = new Logger(MockProvider.name);

  private decode(b64: string): string {
    return Buffer.from(b64, 'base64').toString('utf8');
  }

  streamChat(messages: ChatMessage[], options?: StreamOptions): Observable<string> {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    
    // Check for Arabic unicode range without arabic characters in source file
    const isArabic = /[\u0600-\u06FF]/.test(lastUserMessage);
    let textToStream = '';

    const queryLower = lastUserMessage.toLowerCase();

    // Decode Arabic keywords using base64 helper
    const keywordMarhaban = this.decode('2YXYsdit2KjYpw==');
    const keywordSalam = this.decode('2LPZhNin2YU=');
    const keywordHala = this.decode('2YfZhNin');
    const keywordKayfalhal = this.decode('2YPZitmBINin2YTYrdin2YQ=');
    const keywordManant = this.decode('2YXZhiDYo9mG2Ko=');
    const keywordManant2 = this.decode('2YXZhiDYp9mG2Ko=');
    const keywordManhuwa = this.decode('2YXZhiDZh9mI');
    const keywordQissah = this.decode('2YLYtdip');
    const keywordMilaf = this.decode('2YXZhNmB');
    const keywordSafhah = this.decode('2LXZgdit2Kk=');
    const keywordMuhtawa = this.decode('2YXYrdiq2YjZiQ==');
    const keywordSiyaq = this.decode('2LPZitin2YI=');
    const keywordLakhis = this.decode('2YTYrti1');
    const keywordIqra = this.decode('2KfZgtix2KM=');
    const keywordTahlil = this.decode('2KrYrdmE2YrZhA==');
    const keywordTaqrir = this.decode('2KrZgtix2YrYsQ==');

    const isGreetingOrIdentity = 
      queryLower.includes(keywordMarhaban) || 
      queryLower.includes(keywordSalam) || 
      queryLower.includes(keywordHala) ||
      queryLower.includes(keywordKayfalhal) || 
      queryLower.includes(keywordManant) ||
      queryLower.includes(keywordManant2) ||
      queryLower.includes('hello') ||
      queryLower.includes('hi') ||
      queryLower.includes('who are you') ||
      queryLower === 'chathsm' ||
      queryLower.includes('who is chathsm') ||
      (queryLower.includes('who is') && queryLower.includes('chathsm')) ||
      (queryLower.includes(keywordManhuwa) && queryLower.includes('chathsm'));

    const hasZeroLaziness = messages.some(
      m => m.role === 'system' && m.content.includes('Zero-Laziness Protocol')
    );

    if (options?.messageType === 'greeting') {
      textToStream = isArabic 
        ? this.decode('2YfZhNinINio2YMg8J+RiyDZg9mK2YEg2KPZgtiv2LEg2KPYs9in2LnYr9mD2J8=')
        : `Hello! How can I help you today?`;
    } else if (options?.messageType === 'empty') {
      textToStream = isArabic
        ? this.decode('2YrYsdis2Ykg2YPYqtin2KjYqSDYs9ik2KfZhNmDINmE2YTYqNiv2KEu')
        : `Please write your question to start.`;
    } else if (options?.messageType === 'short_message') {
      textToStream = isArabic
        ? this.decode('2LHYs9in2YTYqtmDINmC2LXZitix2Kkg2KzYr9in2YsuINmH2YQg2YrZhdmD2YbZgyDYqtmI2LbZititINiz2KTYp9mE2YMg2KPZg9ir2LHYnw==')
        : `Your message is very short. Could you please clarify your question?`;
    } else if (hasZeroLaziness || options?.messageType === 'code_request') {
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
        queryLower.includes(keywordMilaf) || 
        queryLower.includes(keywordSafhah) || 
        queryLower.includes(keywordMuhtawa) || 
        queryLower.includes(keywordSiyaq) ||
        queryLower.includes('file') || 
        queryLower.includes('page') || 
        queryLower.includes('context') || 
        queryLower.includes('document') || 
        queryLower.includes('read') || 
        queryLower.includes('summarize') ||
        queryLower.includes(keywordLakhis) ||
        queryLower.includes(keywordIqra) ||
        queryLower.includes(keywordTahlil) ||
        queryLower.includes(keywordTaqrir) ||
        queryLower.includes('analysis') ||
        queryLower.includes('report');

      if (!isRelated) {
        textToStream = isArabic 
          ? this.decode('2LnYsNix2KfZi9iMINmK2YXZg9mG2YbZiiDZhdiz2KfYudiv2KrZgyDZgdmC2Lcg2YHZiiDYp9mE2YXZiNin2LbZiti5INin2YTZhdiq2LnZhNmC2Kkg2KjZhdit2KrZiNmJINmH2LDZhyDYp9mE2LXZgdit2Kku')
          : `Sorry, I can only assist you with topics related to the content of this page.`;
      } else {
        textToStream = isArabic
          ? this.decode('2KXZhNmK2YMg2KfZhNil2KzYp9io2Kkg2KfZhNmF2KjZhtmK2Kkg2K3Ytdix2YrYp9mLINi52YTZiSDYp9mE2LPZitin2YIg2KfZhNmF2KrYp9itINmB2Yog2KfZhNmF2LPYqtmG2K8g2KfZhNmF2LHZgdmCOgoKIyMjINiq2K3ZhNmK2YQg2YXYrdiq2YjZiSDYp9mE2LXZgdit2Kkv2KfZhNmF2LPYqtmG2K86Ci0gKirYp9mE2YXZhNiu2LUg2KfZhNi52KfZhToqKiDYqtmFINiq2K3ZhNmK2YQg2KfZhNmF2YTZgSDYqNmG2KzYp9itINmI2KrZhNiu2YrYtSDYp9mE2YbZgtin2Lcg2KfZhNix2KbZitiz2YrYqSDZgdmK2YcuCi0gKirYp9mE2YbYqtin2KbYrCDYp9mE2YXZh9mF2Kk6Kiog2YrYrdiq2YjZiiDYp9mE2YXYs9iq2YbYryDYudmE2Ykg2KrZgtin2LHZitixINiq2YHYtdmK2YTZitipINiq2KrZiNin2YHZgiDZhdi5INiz2KTYp9mE2YMuCi0gKirYp9mE2KrZiNi12YrYp9iqOioqINmK2YjYtdmJINio2KfYqtio2KfYuSDYp9mE2K7Yt9mI2KfYqiDYp9mE2Yij2Kix2K/YqSDZgdmKINin2YTYtdmB2K3YqSDZhNiq2K3ZgtmK2YIg2KfZhNmG2KrYp9im2Kwg2KfZhNmF2LHYrNmI2Kku')
          : `Here is the response based strictly on the provided context of the attached document:

### Document Context Analysis:
- **General Summary:** The document has been successfully processed, extracting the core concepts.
- **Key Details:** Found relevant information in the text that directly addresses your query.
- **Recommendations:** It is advised to follow the procedures listed in the page to achieve the best results.`;
      }
    } else if (options?.webSearch) {
      textToStream = isArabic
        ? this.decode('8J+UjSAqKtmG2KrYp9im2Kwg2KfZhNio2K3YqzoqKgoKIyMjINmF2LnZhNmI2YXYp9iqINiz2LHZiti52Kkg2YjZhdit2K/Yq9ipOgotICoq2KfZhNmF2YjYttmI2Lkg2KfZhNix2KbZitiz2Yo6Kiog2KfZhNil2KzYp9io2Kkg2KfZhNmF2KjYp9i02LHYqSDYudmE2Ykg2KfYs9iq2YHYs9in2LHZgy4KLSAqKtin2YTYqtmB2KfYtdmK2YQg2KfZhNmF2YfZhdipOioqINmF2LnZhNmI2YXYp9iqINmF2KzZhdi52Kkg2YXZhiDZhdi12KfYr9ixINmF2YjYq9mI2YLYqSDZhNi52KfZhSAyMDI2LgotICoq2KfZhNiu2YTYp9i12Kkg2KfZhNiv2YLZitmC2Kk6Kiog2YfYsNinINin2YTYsdivINmF2KrZiNin2LLZhiDZiNmF2KjYp9i02LEg2YXZhiDYutmK2LEg2KXYt9in2YTYqSDYo9mGINin2K7Yqti12KfYsSDZhdiu2YQu')
        : `🔍 **Search Results:**

### Instant Web Insights:
- **Core Subject:** Direct and balanced answer matching your query.
- **Key Details:** Compiled data points from top sources updated for 2026.
- **Balanced Summary:** Delivered efficiently without fluff or redundant introductions.`;
    } else if (options?.messageType === 'explanation') {
      textToStream = isArabic
        ? this.decode('2KXZhNmK2YMg2KfZhNil2KzYp9io2Kkg2KfZhNmF2KjYp9i02LHYqSDZiNin2YTYr9mC2YrZgtipOgoKIyMjINin2YTZhtmC2KfYtyDYp9mE2KPYs9in2LPZitipINio2KfZhNiq2YHYtdmK2YQ6Ci0gKirYp9mE2YXYudmG2Ykg2YjYp9mE2YXZgdmH2YjZhToqKiDYtNix2K0g2K/ZgtmK2YIg2YjZhdio2KfYtNixINmE2YTZhtmC2LfYqSDYp9mE2YXYt9mE2YjYqNipINio2YPZgdin2KHYqSDYudin2YTZitipINmB2Yog2LnYr9ivINin2YTZg9mE2YXYp9iqLgotICoq2KfZhNij2YfZhdmK2Kkg2YjYp9mE2YHYp9im2K/YqToqKiDYqtmC2K/ZitmFINmC2YrZhdipINit2YLZitmC2YrYqSDYqtmG2KfYs9ioINin2YTYs9mK2KfZgiDZiNmF2YPYqtmG2KjYqSDYqNiz2YTYp9iz2Kkg2KrYp9mF2KkuCi0gKirYp9mE2YfZitmD2YQg2KfZhNmF2YbYuNmFOioqINix2K8g2YXZgtiz2YUg2YTYudmG2KfYtdixINmF2LHZitit2Kkg2YTZhNi52YrZhiDYqNin2UpD')
        : `### Detailed Explanation:
- **Core Principles:** A robust and structured overview of the requested topic.
- **Key Features:** Built with modular guidelines in mind.
- **Best Practices:** Designed for clean separation of concerns and high maintainability.`;
    } else if (isArabic) {
      if (queryLower.includes(keywordQissah)) {
        textToStream = this.decode('2KXZhNmK2YMg2YLYtdipINmC2LXZitix2Kkg2YjZhdi52KjYsdipOgoKIyMjINio2KbYsSDYp9mE2K3Zg9mF2KkK2LnYp9i0INij2YfZhCDZgtix2YrYqSDYtdi62YrYsdipINio2YrZhiDYp9mE2KzYqNin2YQg2YHZiiDYs9mE2KfZhS4g2YPYp9mGINmE2K/ZitmH2YUg2KjYptixINmF2KfYoSDZgdix2YrYryDZitmF2YbYrSDZg9mEINmF2YYg2YrYtNix2Kgg2YXZhtmHINin2YTYrdmD2YXYqSDZiNix2KTZitipINin2YTYrNin2YbYqCDYp9mE2KXZitis2KfYqNmKLiAK2LDYp9iqINmK2YjZhdiMINiy2KfYsSDYp9mE2YLYsdmK2Kkg2LrYsdmK2Kgg2YrYqNit2Ksg2LnZhiDYp9mE2LPYudin2K/YqdiMINmB2LTYsdioINmF2YYg2KfZhNio2KbYsSDZiNij2K/YsdmDINij2YYg2KfZhNiz2LnYp9iv2Kkg2YTYpyDYqtmP2KjYrdirINi52YbZh9inINio2KfZhNiu2KfYsdisINio2YQg2KrZhtio2Lkg2YXZhiDYt9ix2YrZgtipINix2KTZitiq2YbYpyDZhNmE2KPYtNmK2KfYoS4=');
      } else {
        textToStream = this.decode('2KXZhNmK2YMg2KfZhNil2KzYp9io2Kkg2KfZhNmF2KjYp9i02LHYqSDZiNin2YTYr9mC2YrZgtipOgoKIyMjINin2YTZhtmC2KfYtyDYp9mE2KPYs9in2LPZitipINio2KfZhNiq2YHYtdmK2YQ6Ci0gKirYp9mE2YXYudmG2Ykg2YjYp9mE2YXZgdmH2YjZhToqKiDYtNix2K0g2K/ZgtmK2YIg2YjZhdio2KfYtNixINmE2YTZhtmC2LfYqSDYp9mE2YXYt9mE2YjYqNipINio2YPZgdin2KHYqSDYudin2YTZitipINmB2Yog2LnYr9ivINin2YTZg9mE2YXYp9iqLgotICoq2KfZhNij2YfZhdmK2Kkg2YjYp9mE2YHYp9im2K/YqToqKiDYqtmC2K/ZitmFINmC2YrZhdipINit2YLZitmC2YrYqSDYqtmG2KfYs9ioINin2YTYs9mK2KfZgiDZiNmF2YPYqtmG2KjYqSDYqNiz2YTYp9iz2Kkg2KrYp9mF2KkuCi0gKirYp9mE2YfZitmD2YQg2KfZhNmF2YbYuNmFOioqINix2K8g2YXZgtiz2YUg2YTYudmG2KfYtdixINmF2LHZitit2Kkg2YTZhNi52YrZhiDYqNin2UpD');
      }
    } else {
      if (queryLower.includes('story') || queryLower.includes('tale')) {
        textToStream = `Here is a brief, inspiring story:

### The Music of Time
In a quiet valley, a young clockmaker crafted clocks that played melodies reflecting the current weather. 
A traveler came seeking a clock that could predict the future. The clockmaker replied: "My clocks only capture the beauty of the present moment, which is the only time we truly have."`;
      } else {
        textToStream = `### Key Insights:
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
      }, 50);

      return () => {
        clearInterval(intervalId);
      };
    });
  }

  async generateTitle(firstMessage: string): Promise<string> {
    const isArabic = /[\u0600-\u06FF]/.test(firstMessage);
    const words = firstMessage.split(' ').slice(0, 4).join(' ');
    
    if (isArabic) {
      const titlePrefix = this.decode('2YXYrdin2K/Yq9ipOiA='); // "محادثة: "
      return `${titlePrefix}${words || '...'}...`;
    } else {
      return `Chat: ${words || 'New'}...`;
    }
  }
}
