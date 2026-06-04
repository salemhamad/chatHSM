import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly apiKey: string | null;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || null;
    if (!this.apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY is not configured. Falling back to local mock embeddings generator.',
      );
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim() === '') {
      return this.generateMockEmbedding('');
    }

    if (this.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            input: text,
            model: 'text-embedding-3-small',
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenAI API responded with status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].embedding) {
          return data.data[0].embedding;
        } else {
          throw new Error('Invalid embeddings response structure from OpenAI.');
        }
      } catch (error) {
        this.logger.error(`Failed to generate OpenAI embedding: ${error.message}. Falling back to mock.`, error.stack);
        return this.generateMockEmbedding(text);
      }
    }

    return this.generateMockEmbedding(text);
  }

  /**
   * Generates a deterministic, normalized 1536-dimensional mock vector
   * based on the hash of individual words. This creates a keyword-overlap
   * semantic simulation model for RAG local testing.
   */
  private generateMockEmbedding(text: string): number[] {
    const dimensions = 1536;
    const result = new Float32Array(dimensions);
    
    // Clean and split text into words (removing punctuation, lowercasing)
    // Support Arabic characters as well in the regex
    const words = text
      .toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2); // Ignore short words / stop words

    if (words.length === 0) {
      // Fallback if no words match (e.g., short input or punctuation only)
      words.push(text || 'empty');
    }

    // Helper to generate a deterministic unit vector for a given word seed string
    const getWordVector = (word: string): number[] => {
      let seed = 0;
      for (let i = 0; i < word.length; i++) {
        seed = (seed << 5) - seed + word.charCodeAt(i);
        seed |= 0; // Convert to 32bit integer
      }

      // Mulberry32
      const random = () => {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };

      const vec = new Array(dimensions);
      let sumSq = 0;
      for (let i = 0; i < dimensions; i++) {
        const val = random() * 2 - 1;
        vec[i] = val;
        sumSq += val * val;
      }
      const mag = Math.sqrt(sumSq) || 1;
      return vec.map((v) => v / mag);
    };

    // Accumulate word vectors
    for (const word of words) {
      const vec = getWordVector(word);
      for (let i = 0; i < dimensions; i++) {
        result[i] += vec[i];
      }
    }

    // Normalize final vector
    let sumSq = 0;
    for (let i = 0; i < dimensions; i++) {
      sumSq += result[i] * result[i];
    }
    const mag = Math.sqrt(sumSq) || 1;

    const finalEmbedding: number[] = new Array(dimensions);
    for (let i = 0; i < dimensions; i++) {
      finalEmbedding[i] = result[i] / mag;
    }

    return finalEmbedding;
  }
}
