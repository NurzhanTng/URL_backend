import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ShortenUrlDto {
  @IsString()
  @IsNotEmpty()
  originalUrl: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(20)
  alias?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
