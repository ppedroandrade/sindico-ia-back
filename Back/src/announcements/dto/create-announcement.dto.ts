import { AnnouncementType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(5)
  content: string;

  @IsEnum(AnnouncementType)
  type: AnnouncementType;

  @IsOptional()
  @IsDateString()
  publishAt?: string;
}
