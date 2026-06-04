import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface RateLimitEntry {
  timestamps: number[];
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly requestsPerMinute = 60;
  private readonly requestMap = new Map<string, RateLimitEntry>();
  private lastCleanup = Date.now();
  private readonly cleanupIntervalMs = 60_000;

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // Let auth guards handle unauthenticated requests
    }

    // Clean up stale entries periodically
    this.cleanupStaleEntries();

    // Check per-minute rate limit
    const now = Date.now();
    const userId: string = user.id;
    let entry = this.requestMap.get(userId);

    if (!entry) {
      entry = { timestamps: [] };
      this.requestMap.set(userId, entry);
    }

    // Remove timestamps older than 1 minute
    const oneMinuteAgo = now - 60_000;
    entry.timestamps = entry.timestamps.filter((t) => t > oneMinuteAgo);

    if (entry.timestamps.length >= this.requestsPerMinute) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded. Maximum 60 requests per minute.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.timestamps.push(now);

    // Check daily token limit
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        dailyTokensUsed: true,
        dailyTokensLimit: true,
        lastTokenReset: true,
      },
    });

    if (!dbUser) {
      return true;
    }

    // Reset daily counter if last reset was before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(dbUser.lastTokenReset);
    lastReset.setHours(0, 0, 0, 0);

    if (lastReset < today) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          dailyTokensUsed: 0,
          lastTokenReset: new Date(),
        },
      });
      return true;
    }

    if (dbUser.dailyTokensUsed >= dbUser.dailyTokensLimit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Daily token limit reached. Please try again tomorrow.',
          error: 'Token Limit Exceeded',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private cleanupStaleEntries(): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupIntervalMs) {
      return;
    }

    this.lastCleanup = now;
    const oneMinuteAgo = now - 60_000;

    for (const [key, entry] of this.requestMap.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => t > oneMinuteAgo);
      if (entry.timestamps.length === 0) {
        this.requestMap.delete(key);
      }
    }
  }
}
