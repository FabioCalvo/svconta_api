/*
  # Add Version Files Support (No RLS)

  ## Overview
  This migration adds support for multiple file updates per version, allowing the system to track
  different types of files with their specific destination paths.

  ## New Tables

  ### `version_files`
  Stores information about individual files associated with a version release.

  ## Security
  Authorization handled at application level via NestJS guards
*/

-- Create file type enum
CREATE TYPE file_type_enum AS ENUM (
    'executable',
    'report',
    'database',
    'document',
    'library',
    'configuration',
    'other'
);

-- Create version_files table
CREATE TABLE IF NOT EXISTS version_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type file_type_enum NOT NULL,
    download_url VARCHAR(500) NOT NULL,
    destination_path TEXT NOT NULL,
    file_size BIGINT,
    checksum VARCHAR(255),
    mandatory BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    description TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_version_files_version_id ON version_files(version_id);
CREATE INDEX IF NOT EXISTS idx_version_files_file_type ON version_files(file_type);
CREATE INDEX IF NOT EXISTS idx_version_files_active ON version_files(active);
CREATE INDEX IF NOT EXISTS idx_version_files_priority ON version_files(priority);

-- Create trigger for updating updated_at column
CREATE TRIGGER update_version_files_updated_at
    BEFORE UPDATE ON version_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
