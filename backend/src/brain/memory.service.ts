import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async saveMemory(userId: string, category: string, key: string, value: string, confidence: number = 1.0) {
    const memory = await this.prisma.userMemory.create({
      data: {
        userId,
        category,
        memoryKey: key,
        memoryValue: value,
        confidence,
      },
    });
    this.logger.debug(`Saved memory for user ${userId}: [${category}] ${key} = ${value}`);
    return memory;
  }

  async getUserMemories(userId: string, category?: string) {
    const whereClause: any = { userId };
    if (category) {
      whereClause.category = category;
    }
    return this.prisma.userMemory.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async forgetMemory(userId: string, memoryId: string) {
    await this.prisma.userMemory.deleteMany({
      where: {
        id: memoryId,
        userId, // Ensure user owns it
      },
    });
    this.logger.debug(`Deleted memory ${memoryId} for user ${userId}`);
  }

  // Format memory into a string block to inject into system prompt
  async getMemoryContextForPrompt(userId: string): Promise<string> {
    const memories = await this.getUserMemories(userId);
    if (memories.length === 0) return '';

    let context = '### USER LONG TERM MEMORY ###\n';
    memories.forEach(m => {
      context += `- [${m.category}] ${m.memoryKey}: ${m.memoryValue}\n`;
    });
    context += '#############################\n';
    
    return context;
  }
}
