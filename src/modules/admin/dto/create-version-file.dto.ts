import { IsString, IsEnum, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { FileType } from '../../../entities/version-file.entity';

export class CreateVersionFileDto {
  @IsString()
  @IsNotEmpty()
  version_id: string;

  @IsString()
  @IsNotEmpty()
  file_name: string;

  @IsEnum(FileType)
  @IsNotEmpty()
  file_type: FileType;

  @IsString()
  @IsNotEmpty()
  download_url: string;

  @IsString()
  @IsNotEmpty()
  destination_path: string;

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
