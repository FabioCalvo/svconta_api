import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidateLicenseDto {
  @ApiProperty({ example: '12345678901234567', description: '17-digit unlock code' })
  @IsString()
  unlock_code: string;

  @ApiProperty({ example: '1234567890-123456', description: 'Device fingerprint' })
  @IsString()
  device_fingerprint: string;
}