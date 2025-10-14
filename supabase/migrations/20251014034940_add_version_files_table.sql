/*
  # Add Version Files Support

  ## Overview
  This migration adds support for multiple file updates per version, allowing the system to track
  different types of files (executables, reports, database files, documents) with their specific
  destination paths.

  ## New Tables
  
  ### `version_files`
  Stores information about individual files associated with a version release.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for the file record
  - `version_id` (uuid, foreign key) - References the parent version
  - `file_name` (varchar) - Name of the file
  - `file_type` (enum) - Type of file (executable, report, database, document, library, configuration, other)
  - `download_url` (varchar) - URL where the file can be downloaded
  - `destination_path` (text) - Windows-style destination path (e.g., C:\Program Files\SV Conta\)
  - `file_size` (bigint, nullable) - Size of the file in bytes
  - `checksum` (varchar, nullable) - SHA256 or MD5 checksum for file integrity verification
  - `mandatory` (boolean, default: false) - Whether this file update is mandatory
  - `active` (boolean, default: true) - Whether this file is currently active/available
  - `description` (text, nullable) - Description of what this file contains or does
  - `priority` (integer, default: 0) - Installation priority (lower numbers install first)
  - `created_at` (timestamp) - Record creation timestamp
  - `updated_at` (timestamp) - Record last update timestamp

  ## New Enums
  
  ### `file_type_enum`
  Defines the types of files that can be distributed:
  - `executable` - Application executables (.exe, .dll)
  - `report` - Report templates or files
  - `database` - Database files or schemas
  - `document` - Documentation files (PDF, DOC, etc.)
  - `library` - Additional libraries or dependencies
  - `configuration` - Configuration files
  - `other` - Other file types

  ## Indexes
  - `idx_version_files_version_id` - Fast lookup of files by version
  - `idx_version_files_file_type` - Filter files by type
  - `idx_version_files_active` - Filter active files

  ## Foreign Keys
  - version_files.version_id -> versions.id (CASCADE on delete)

  ## Security
  - Enable RLS on `version_files` table
  - Add policies for public read access to active files
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

-- Enable Row Level Security
ALTER TABLE version_files ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active files
CREATE POLICY "Public can view active version files"
    ON version_files
    FOR SELECT
    USING (active = true);

-- Create policy for authenticated users to view all files
CREATE POLICY "Authenticated users can view all version files"
    ON version_files
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for authenticated users to insert files
CREATE POLICY "Authenticated users can insert version files"
    ON version_files
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy for authenticated users to update files
CREATE POLICY "Authenticated users can update version files"
    ON version_files
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy for authenticated users to delete files
CREATE POLICY "Authenticated users can delete version files"
    ON version_files
    FOR DELETE
    TO authenticated
    USING (true);
