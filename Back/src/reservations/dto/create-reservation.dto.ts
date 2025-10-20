import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  userId: string;

  @IsString()
  areaId: string;

  @IsDateString()
  date: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsString()
  observations?: string;
}
