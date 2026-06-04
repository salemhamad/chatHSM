import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(file: any, userId: string) {
    const fileId = uuidv4();
    const extension = file.originalname.split('.').pop() || 'bin';
    const key = `users/${userId}/attachments/${fileId}.${extension}`;

    // Upload using StorageService
    const url = await this.storage.upload(key, file.buffer, file.mimetype);

    // Save metadata in database
    return this.prisma.attachment.create({
      data: {
        id: fileId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        storageKey: key,
        url,
      },
    });
  }

  async findById(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Refresh presigned URL if using S3
    const presignedUrl = await this.storage.getSignedUrl(attachment.storageKey);
    
    return {
      ...attachment,
      url: presignedUrl,
    };
  }

  async delete(id: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: {
        message: true,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Verify ownership
    const keyUserPart = `users/${userId}/`;
    if (
      (attachment.message && attachment.message.userId !== userId) ||
      (!attachment.message && !attachment.storageKey.startsWith(keyUserPart))
    ) {
      throw new ForbiddenException('You do not have access to this attachment');
    }

    // Delete file from S3 / Local
    await this.storage.delete(attachment.storageKey);

    // Delete database record
    await this.prisma.attachment.delete({
      where: { id },
    });

    return { success: true };
  }
}
