import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { LicenseType } from '../../../entities/license.entity';

export class ProcessLicenseDto {
  @ApiProperty({ example: '1234567890-123456', description: 'Device fingerprint in format ##########-######' })
  @IsString()
  device_fingerprint: string;

  @ApiProperty({ example: '201230123', description: 'user id #########' })
  @IsString()
  user_id: string;

  @ApiProperty({ example: 'customer@example.com' })
  @IsOptional()
  @IsEmail()
  customer_email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  customer_name: string;

  @ApiProperty({ enum: LicenseType, required: false, default: LicenseType.TRIAL })
  @IsOptional()
  @IsEnum(LicenseType)
  license_type?: LicenseType;
}