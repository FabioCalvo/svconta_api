import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDateString, IsOptional, IsDecimal, IsBoolean } from 'class-validator';
import { LicenseType, PaymentStatus } from '../../../entities/license.entity';

export class UpdateLicenseDto {
  @ApiProperty({ required: false, enum: LicenseType })
  @IsOptional()
  @IsEnum(LicenseType)
  type?: LicenseType;

  @ApiProperty({ required: false, example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expires_at?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ required: false, enum: PaymentStatus })
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
}