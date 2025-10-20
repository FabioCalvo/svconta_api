import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateVersionDto {
  @ApiProperty({ required: false, example: '1.0.1' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ required: false, example: 'Bug fixes and performance improvements' })
  @IsOptional()
  @IsString()
  release_notes?: string;

  @ApiProperty({ required: false, example: 'https://example.com/download/v1.0.1' })
  @IsOptional()
  @IsString()
  download_url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ required: false, example: 52428800 })
  @IsOptional()
  @IsNumber()
  file_size?: number;

  @ApiProperty({ required: false, example: 'sha256:abc123...' })
  @IsOptional()
  @IsString()
  checksum?: string;

  @ApiProperty({ required: false, example: '0.9.0', description: 'Minimum version required before updating to this version' })
  @IsOptional()
  @IsString()
  required_version?: string;

  @ApiProperty({ required: false, example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  release_date?: Date;
}