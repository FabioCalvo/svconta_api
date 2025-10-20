import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('versions')
export class Version {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  version: string;

  @Column({ type: 'text', nullable: true })
  release_notes: string;

  @Column()
  download_url: string;

  @Column({ default: false })
  mandatory: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  file_size: number;

  @Column({ nullable: true })
  checksum: string;

  @Column({ nullable: true })
  required_version: string;

  @Column()
  release_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}