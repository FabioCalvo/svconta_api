-- Add second_last_name and personal_id fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS second_last_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_id VARCHAR(255);
