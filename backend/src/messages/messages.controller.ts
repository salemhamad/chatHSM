import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Send a new message inside a conversation' })
  create(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.create(
      conversationId,
      req.user.id,
      'USER',
      dto.content,
      dto.attachmentIds || [],
    );
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get messages for a conversation (paginated)' })
  findAll(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.messagesService.findByConversation(
      conversationId,
      req.user.id,
      cursor,
      limitNum,
    );
  }

  @Get('messages/pinned')
  @ApiOperation({ summary: 'Get all pinned messages for the logged in user' })
  findPinned(@Request() req) {
    return this.messagesService.getPinnedByUser(req.user.id);
  }

  @Post('messages/:id/pin')
  @ApiOperation({ summary: 'Toggle pin on a message' })
  pin(@Request() req, @Param('id') id: string) {
    return this.messagesService.pin(id, req.user.id);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete a message' })
  remove(@Request() req, @Param('id') id: string) {
    return this.messagesService.delete(id, req.user.id);
  }
}
