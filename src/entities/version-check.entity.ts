import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('version_checks')
export class VersionCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column()
  current_version: string;

  @Column()
  latest_version: string;

  @Column({ default: false })
  update_available: boolean;

  @Column({ nullable: true })
  device_fingerprint: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @CreateDateColumn()
  created_at: Date;
}