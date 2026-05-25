import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsString()
  @MinLength(1)
  content: string;
}
