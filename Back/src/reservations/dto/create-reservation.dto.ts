import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  areaId: string;

  @IsDateString()
  date: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsInt()
  @Min(1)
  guests: number;

  @IsOptional()
  @IsString()
  observations?: string;
}
