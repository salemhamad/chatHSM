import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'The text content of the message' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false, type: [String], description: 'Optional list of attachment IDs to associate with this message' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachmentIds?: string[];
}
