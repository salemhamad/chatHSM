import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

interface RetrievalResult {
  content: string;
  source: string;
  similarity: number;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  /**
   * Performs semantic search and retrieves relevant context chunks.
   * Calculates cosine similarity using the dot product (since our embeddings are normalized).
   */
  async retrieveContext(
    queryText: string,
    k = 3,
    threshold = 0.7,
  ): Promise<{ context: string | null; isRelated: boolean; bestSimilarity: number }> {
    try {
      const queryVector = await this.embeddingService.getEmbedding(queryText);
      const matches: RetrievalResult[] = [];

      // 1. Fetch all enabled document chunks
      const chunks = await this.prisma.documentChunk.findMany({
        where: {
          document: {
            isEnabled: true,
            status: 'PROCESSED',
          },
        },
      });

      for (const chunk of chunks) {
        try {
          const chunkVector = JSON.parse(chunk.embedding) as number[];
          const similarity = this.cosineSimilarity(queryVector, chunkVector);
          matches.push({
            content: chunk.content,
            source: `Document Chunk`,
            similarity,
          });
        } catch (e) {
          this.logger.error(`Error parsing embedding for chunk ${chunk.id}: ${e.message}`);
        }
      }

      // 2. Fetch all direct facts
      const facts = await this.prisma.directFact.findMany();

      for (const fact of facts) {
        try {
          const factVector = JSON.parse(fact.embedding) as number[];
          const similarity = this.cosineSimilarity(queryVector, factVector);
          matches.push({
            content: fact.content,
            source: `Direct Fact`,
            similarity,
          });
        } catch (e) {
          this.logger.error(`Error parsing embedding for fact ${fact.id}: ${e.message}`);
        }
      }

      // 3. Sort by similarity descending
      matches.sort((a, b) => b.similarity - a.similarity);

      // Log top similarity for debug
      const bestSimilarity = matches.length > 0 ? matches[0].similarity : 0;
      const hasApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key';
      const activeThreshold = hasApiKey ? threshold : 0.3;
      
      this.logger.log(`Semantic search best match similarity: ${bestSimilarity.toFixed(4)} (Threshold: ${activeThreshold})`);

      // 4. Filter by threshold and take top K
      const filteredMatches = matches
        .filter((match) => match.similarity >= activeThreshold)
        .slice(0, k);

      const isRelated = filteredMatches.length > 0;

      if (filteredMatches.length === 0) {
        return { context: null, isRelated: false, bestSimilarity };
      }

      // 5. Format context block
      const contextString = filteredMatches
        .map(
          (match, i) =>
            `[Source: ${match.source} | Context Match #${i + 1}]\n${match.content}`,
        )
        .join('\n\n---\n\n');

      return {
        context: contextString,
        isRelated: true,
        bestSimilarity,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve RAG context: ${error.message}`, error.stack);
      return { context: null, isRelated: false, bestSimilarity: 0 };
    }
  }

  /**
   * Computes the cosine similarity between two normalized vectors.
   * Since the vectors are normalized, cosine similarity is simply their dot product.
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    return dotProduct;
  }
}
