import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  create(@Request() req, @Body() dto: CreateConversationDto) {
    return this.conversationsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all conversations for logged in user' })
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.conversationsService.findAllByUser(req.user.id, pageNum, limitNum);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search conversations and message content' })
  search(@Request() req, @Query('q') query: string) {
    return this.conversationsService.search(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation details' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.conversationsService.findById(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update conversation settings (title, pin status)' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete conversation' })
  remove(@Request() req, @Param('id') id: string) {
    return this.conversationsService.delete(id, req.user.id);
  }
}
