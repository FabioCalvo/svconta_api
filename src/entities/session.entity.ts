import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { License } from './license.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  device_fingerprint: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  latitude: number;

  @Column({ nullable: true })
  longitude: number;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  device_info: string;

  @Column({ nullable: true })
  app_version: string;

  @Column({ nullable: true })
  os_info: string;

  @Column({ nullable: true })
  session_duration: number;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  ended_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => License, license => license.sessions)
  @JoinColumn({ name: 'license_id' })
  license: License;

  @Column()
  license_id: string;
}