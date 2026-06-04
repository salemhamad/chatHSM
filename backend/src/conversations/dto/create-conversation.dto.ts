import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ required: false, description: 'The title of the conversation' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;
}
