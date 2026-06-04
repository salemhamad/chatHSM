import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';
import { IsString, IsNotEmpty } from 'class-validator';

class CreateFactDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

@ApiTags('knowledge')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document (PDF, TXT, DOCX, MD) for RAG processing' })
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    
    // Whitelist file types
    const allowedExtensions = ['.pdf', '.txt', '.docx', '.md'];
    const hasAllowedExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );

    if (!hasAllowedExtension) {
      throw new BadRequestException('Invalid file type. Only PDF, TXT, DOCX, and MD are supported.');
    }

    // Limit to 25MB
    if (file.size > 25 * 1024 * 1024) {
      throw new BadRequestException('File is too large. Maximum size is 25MB.');
    }

    return this.knowledgeService.createDocument(
      file.originalname,
      file.mimetype,
      file.size,
      file.buffer,
    );
  }

  @Get('documents')
  @ApiOperation({ summary: 'List all uploaded RAG documents' })
  async getDocuments() {
    return this.knowledgeService.getDocuments();
  }

  @Patch('documents/:id/toggle')
  @ApiOperation({ summary: 'Toggle document enabled status' })
  async toggleDocument(@Param('id') id: string) {
    return this.knowledgeService.toggleDocument(id);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete document and associated chunks permanently' })
  async deleteDocument(@Param('id') id: string) {
    return this.knowledgeService.deleteDocument(id);
  }

  @Post('facts')
  @ApiOperation({ summary: 'Create a new direct text fact/instruction' })
  async createFact(@Body() dto: CreateFactDto) {
    return this.knowledgeService.createFact(dto.content);
  }

  @Get('facts')
  @ApiOperation({ summary: 'List all direct text facts' })
  async getFacts() {
    return this.knowledgeService.getFacts();
  }

  @Delete('facts/:id')
  @ApiOperation({ summary: 'Delete direct text fact permanently' })
  async deleteFact(@Param('id') id: string) {
    return this.knowledgeService.deleteFact(id);
  }
}
