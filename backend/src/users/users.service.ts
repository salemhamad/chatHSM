import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        language: true,
        dailyTokensUsed: true,
        dailyTokensLimit: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        language: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { displayName?: string; avatarUrl?: string; language?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.displayName !== undefined && {
          displayName: data.displayName,
        }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.language !== undefined && { language: data.language }),
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        language: true,
        dailyTokensUsed: true,
        dailyTokensLimit: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateTokenUsage(userId: string, tokensUsed: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        dailyTokensUsed: {
          increment: tokensUsed,
        },
      },
      select: {
        dailyTokensUsed: true,
        dailyTokensLimit: true,
      },
    });
  }
}
