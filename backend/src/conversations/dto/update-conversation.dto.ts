import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConversationDto {
  @ApiProperty({ required: false, description: 'The title of the conversation' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ required: false, description: 'Whether the conversation is pinned' })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}
