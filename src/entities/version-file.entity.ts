import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Version } from './version.entity';

export enum FileType {
  EXECUTABLE = 'executable',
  REPORT = 'report',
  DATABASE = 'database',
  DOCUMENT = 'document',
  LIBRARY = 'library',
  CONFIGURATION = 'configuration',
  INSTALLER = 'installer',
  ZIP = 'zip',
  OTHER = 'other'
}

@Entity('version_files')
export class VersionFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  version_id: string;

  @ManyToOne(() => Version, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'version_id' })
  version: Version;

  @Column()
  file_name: string;

  @Column({ type: 'enum', enum: FileType })
  file_type: FileType;

  @Column()
  download_url: string;

  @Column({ type: 'text' })
  destination_path: string;

  @Column({ nullable: true })
  file_size: number;

  @Column({ nullable: true })
  checksum: string;

  @Column({ default: false })
  mandatory: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  priority: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
