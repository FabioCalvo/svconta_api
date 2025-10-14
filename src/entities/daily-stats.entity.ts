import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('daily_stats')
export class DailyStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: Date;

  @Column({ default: 0 })
  active_users: number;

  @Column({ default: 0 })
  new_licenses: number;

  @Column({ default: 0 })
  license_validations: number;

  @Column({ default: 0 })
  version_checks: number;

  @Column({ default: 0 })
  app_sessions: number;

  @Column({ default: 0 })
  total_session_duration: number;

  @Column({ type: 'jsonb', nullable: true })
  countries: any;

  @Column({ type: 'jsonb', nullable: true })
  versions: any;

  @Column({ type: 'jsonb', nullable: true })
  license_types: any;

  @CreateDateColumn()
  created_at: Date;
}