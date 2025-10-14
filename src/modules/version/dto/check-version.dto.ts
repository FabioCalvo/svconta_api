import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CheckVersionDto {
  @ApiProperty({ example: '1.0.0' })
  @IsString()
  current_version: string;

  @ApiProperty({ required: false, example: '1234567890-123456' })
  @IsOptional()
  @IsString()
  device_fingerprint?: string;

  @ApiProperty({ required: false })
  @IsOptional()  
  user_id?: string;
}