import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AnalyticsEventType {
  APP_START = 'app_start',
  APP_CLOSE = 'app_close',
  FEATURE_USE = 'feature_use',
  ERROR_OCCURRED = 'error_occurred',
  LICENSE_CHECK = 'license_check',
  VERSION_CHECK = 'version_check',
  UPDATE_DOWNLOAD = 'update_download',
  UPDATE_INSTALL = 'update_install',
}

@Entity('usage_analytics')
export class UsageAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  license_id: string;

  @Column({ nullable: true })
  session_id: string;

  @Column({
    type: 'enum',
    enum: AnalyticsEventType,
  })
  event_type: AnalyticsEventType;

  @Column()
  event_name: string;

  @Column({ type: 'jsonb', nullable: true })
  event_data: any;

  @Column({ nullable: true })
  device_fingerprint: string;

  @Column({ nullable: true })
  app_version: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @CreateDateColumn()
  created_at: Date;
}