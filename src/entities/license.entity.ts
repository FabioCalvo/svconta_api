import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Session } from './session.entity';

export enum LicenseType {
  TRIAL = 'trial',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum PaymentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('licenses')
export class License {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  license_key: string;

  @Column()
  device_fingerprint: string;

  @Column({ unique: true })
  unlock_code: string;

  @Column({
    type: 'enum',
    enum: LicenseType,
    default: LicenseType.TRIAL,
  })
  type: LicenseType;

  @Column()
  expires_at: Date;

  @Column({ default: true })
  active: boolean;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  payment_reference: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.licenses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @OneToMany(() => Session, session => session.license)
  sessions: Session[];
}