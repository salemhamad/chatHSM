import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private useLocalFallback = false;
  private localUploadDir: string;
  private backendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME', 'ai-chat-attachments');
    this.backendUrl = `http://localhost:${this.configService.get<number>('PORT', 3001)}`;
    this.localUploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');
  }

  onModuleInit() {
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION', 'auto');

    // Check if S3 environment variables are placeholders or missing
    if (
      !accessKeyId ||
      !secretAccessKey ||
      accessKeyId.includes('your-') ||
      secretAccessKey.includes('your-') ||
      !endpoint ||
      endpoint.includes('your-')
    ) {
      this.logger.warn('S3/R2 credentials not configured or using placeholders. Falling back to local file storage.');
      this.useLocalFallback = true;
      
      // Ensure local upload directory exists
      if (!fs.existsSync(this.localUploadDir)) {
        fs.mkdirSync(this.localUploadDir, { recursive: true });
      }
    } else {
      this.logger.log('S3/R2 storage configured successfully.');
      this.s3Client = new S3Client({
        region,
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    if (this.useLocalFallback) {
      const filePath = path.join(this.localUploadDir, key);
      const dirPath = path.dirname(filePath);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(filePath, body);
      this.logger.debug(`File uploaded locally: ${filePath}`);
      return `${this.backendUrl}/uploads/${key}`;
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
    
    const publicUrl = this.configService.get<string>('S3_PUBLIC_URL');
    if (publicUrl) {
      return `${publicUrl.replace(/\/$/, '')}/${key}`;
    }

    return await this.getSignedUrl(key);
  }

  async getSignedUrl(key: string): Promise<string> {
    if (this.useLocalFallback) {
      return `${this.backendUrl}/uploads/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    // Signed URL valid for 1 hour (3600 seconds)
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async delete(key: string): Promise<void> {
    if (this.useLocalFallback) {
      const filePath = path.join(this.localUploadDir, key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.debug(`File deleted locally: ${filePath}`);
      }
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}
