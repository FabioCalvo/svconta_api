import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ValidationResult {
  VALID = 'valid',
  INVALID = 'invalid',
  EXPIRED = 'expired',
  NOT_FOUND = 'not_found',
}

@Entity('license_validations')
export class LicenseValidation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  license_id: string;

  @Column()
  unlock_code: string;

  @Column()
  device_fingerprint: string;

  @Column({
    type: 'enum',
    enum: ValidationResult,
  })
  result: ValidationResult;

  @Column({ nullable: true })
  error_message: string;

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