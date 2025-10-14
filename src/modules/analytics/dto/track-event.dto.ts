import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsEnum, IsObject } from 'class-validator';
import { AnalyticsEventType } from '../../../entities/usage-analytics.entity';

export class TrackEventDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  license_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  session_id?: string;

  @ApiProperty({ enum: AnalyticsEventType, example: AnalyticsEventType.APP_START })
  @IsEnum(AnalyticsEventType)
  event_type: AnalyticsEventType;

  @ApiProperty({ example: 'Application Started' })
  @IsString()
  event_name: string;

  @ApiProperty({ required: false, example: { feature: 'dashboard' } })
  @IsOptional()
  @IsObject()
  event_data?: any;

  @ApiProperty({ required: false, example: '1234567890-123456' })
  @IsOptional()
  @IsString()
  device_fingerprint?: string;

  @ApiProperty({ required: false, example: '1.0.0' })
  @IsOptional()
  @IsString()
  app_version?: string;
}