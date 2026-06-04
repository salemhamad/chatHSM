import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateConversationDto) {
    return this.prisma.conversation.create({
      data: {
        userId,
        title: dto.title || 'New Chat',
      },
    });
  }

  async findAllByUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: [
          { isPinned: 'desc' },
          { updatedAt: 'desc' },
        ],
        include: {
          _count: {
            select: { messages: true },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.conversation.count({ where: { userId } }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    return conversation;
  }

  async update(id: string, userId: string, dto: UpdateConversationDto) {
    const conversation = await this.findById(id, userId);

    return this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const conversation = await this.findById(id, userId);

    await this.prisma.conversation.delete({
      where: { id: conversation.id },
    });

    return { success: true };
  }

  async search(userId: string, query: string) {
    if (!query) return [];

    return this.prisma.conversation.findMany({
      where: {
        userId,
        OR: [
          {
            title: {
              contains: query,
            },
          },
          {
            messages: {
              some: {
                content: {
                  contains: query,
                },
              },
            },
          },
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
