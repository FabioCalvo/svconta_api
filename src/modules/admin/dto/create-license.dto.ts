import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsDateString, IsOptional, IsDecimal, IsBoolean } from 'class-validator';
import { LicenseType, PaymentStatus } from '../../../entities/license.entity';

export class CreateLicenseDto {
  @ApiProperty()
  @IsString()
  license_key: string;

  @ApiProperty({ example: '1234567890-123456' })
  @IsString()
  device_fingerprint: string;

  @ApiProperty({ example: '12345678901234567' })
  @IsString()
  unlock_code: string;

  @ApiProperty({ enum: LicenseType, example: LicenseType.TRIAL })
  @IsEnum(LicenseType)
  type: LicenseType;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  expires_at: Date;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ enum: PaymentStatus, required: false, default: PaymentStatus.PENDING })
  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @ApiProperty({ required: false, example: 99.99 })
  @IsOptional()
  @IsDecimal()
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  payment_reference?: string;

  @ApiProperty()
  @IsUUID()
  user_id: string;
}