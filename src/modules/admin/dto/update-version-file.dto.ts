import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { FileType } from '../../../entities/version-file.entity';

export class UpdateVersionFileDto {
  @IsString()
  @IsOptional()
  file_name?: string;

  @IsEnum(FileType)
  @IsOptional()
  file_type?: FileType;

  @IsString()
  @IsOptional()
  download_url?: string;

  @IsString()
  @IsOptional()
  destination_path?: string;

  @IsNumber()
  @IsOptional()
  file_size?: number;

  @IsString()
  @IsOptional()
  checksum?: string;

  @IsBoolean()
  @IsOptional()
  mandatory?: boolean;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priority?: number;
}
