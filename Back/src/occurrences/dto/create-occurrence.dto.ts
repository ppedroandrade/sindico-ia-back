import { OccurrencePriority } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateOccurrenceDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(5)
  description: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsEnum(OccurrencePriority)
  priority?: OccurrencePriority;
}
