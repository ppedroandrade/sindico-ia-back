import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCommonAreaDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  capacity: number;

  @IsNumber()
  pricePerHour: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
