import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(public readonly prisma: PrismaService) {}

  async create(
    conversationId: string,
    userId: string,
    role: string,
    content: string,
    attachmentIds: string[] = [],
  ) {
    // Verify conversation access or create if it doesn't exist
    let conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          id: conversationId,
          userId,
          title: 'New Chat',
        },
      });
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    // Connect attachments if any
    const attachmentsConnect = attachmentIds.map((id) => ({ id }));

    // Create the message and update conversation timestamp
    const [message] = await Promise.all([
      this.prisma.message.create({
        data: {
          role,
          content,
          conversationId,
          userId,
          attachments: {
            connect: attachmentsConnect,
          },
        },
        include: {
          attachments: true,
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return message;
  }

  async findByConversation(
    conversationId: string,
    userId: string,
    cursor?: string,
    limitNum: number = 50,
  ) {
    // Verify conversation access
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      take: limitNum,
      ...(cursor && {
        skip: 1, // Skip the cursor message itself
        cursor: { id: cursor },
      }),
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        attachments: true,
      },
    });

    return messages;
  }

  async delete(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this message');
    }

    await this.prisma.message.delete({
      where: { id },
    });

    return { success: true };
  }

  async pin(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('You do not have permission to pin this message');
    }

    const existingPin = await this.prisma.pinnedItem.findUnique({
      where: {
        userId_messageId: {
          userId,
          messageId,
        },
      },
    });

    if (existingPin) {
      await this.prisma.pinnedItem.delete({
        where: {
          userId_messageId: {
            userId,
            messageId,
          },
        },
      });
      return { pinned: false };
    }

    await this.prisma.pinnedItem.create({
      data: {
        userId,
        messageId,
      },
    });

    return { pinned: true };
  }

  async getPinnedByUser(userId: string) {
    return this.prisma.pinnedItem.findMany({
      where: { userId },
      include: {
        message: {
          include: {
            attachments: true,
            conversation: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
