/*
  # SV Conta Database Schema - Initial Setup

  ## Overview
  Complete database schema for SV Conta Desktop API including users, licenses, versions, 
  sessions, analytics, and validation tracking.

  ## New Tables

  ### `users`
  User accounts with role-based access control
  - Authentication and profile information
  - Roles: super_admin, admin, support, customer
  
  ### `versions`
  Application version releases
  - Version information and download details
  - Release notes and mandatory update flags

  ### `licenses`
  License management for customers
  - License keys and device fingerprints
  - Expiration and payment tracking

  ### `sessions`
  User session tracking
  - Device and location information
  - Session duration monitoring

  ### `usage_analytics`
  Event tracking for application usage
  - User behavior and feature usage
  - Error and event logging

  ### `version_checks`
  Version check request logging
  - Update availability tracking
  - Device and location information

  ### `license_validations`
  License validation request logging
  - Validation results and error tracking
  - Device and location information

  ### `daily_stats`
  Aggregated daily statistics
  - Active users and license metrics
  - Geographic and version distribution

  ## Security
  - All tables have RLS enabled
  - Appropriate policies for data access control
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'support', 'customer');

-- License types enum
CREATE TYPE license_type AS ENUM ('trial', 'basic', 'professional', 'enterprise');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'failed', 'refunded');

-- Analytics event types enum
CREATE TYPE analytics_event_type AS ENUM (
    'app_start', 
    'app_close', 
    'feature_use', 
    'error_occurred', 
    'license_check', 
    'version_check', 
    'update_download', 
    'update_install'
);

-- Validation result enum
CREATE TYPE validation_result AS ENUM ('valid', 'invalid', 'expired', 'not_found');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    phone VARCHAR(50),
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Versions table
CREATE TABLE IF NOT EXISTS versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(50) UNIQUE NOT NULL,
    release_notes TEXT,
    download_url VARCHAR(500) NOT NULL,
    mandatory BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    file_size BIGINT,
    checksum VARCHAR(255),
    release_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_key VARCHAR(255) UNIQUE NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL,
    unlock_code VARCHAR(255) UNIQUE NOT NULL,
    type license_type DEFAULT 'trial',
    expires_at TIMESTAMP NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    payment_status payment_status DEFAULT 'pending',
    amount DECIMAL(10,2),
    payment_reference VARCHAR(255),
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_fingerprint VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    user_agent TEXT,
    device_info TEXT,
    app_version VARCHAR(50),
    os_info TEXT,
    session_duration INTEGER,
    active BOOLEAN DEFAULT TRUE,
    ended_at TIMESTAMP,
    license_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE
);

-- Usage analytics table
CREATE TABLE IF NOT EXISTS usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    license_id UUID,
    session_id UUID,
    event_type analytics_event_type NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_data JSONB,
    device_fingerprint VARCHAR(255),
    app_version VARCHAR(50),
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Version checks table
CREATE TABLE IF NOT EXISTS version_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    current_version VARCHAR(50) NOT NULL,
    latest_version VARCHAR(50) NOT NULL,
    update_available BOOLEAN DEFAULT FALSE,
    device_fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- License validations table
CREATE TABLE IF NOT EXISTS license_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID,
    unlock_code VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL,
    result validation_result NOT NULL,
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily stats table
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL,
    active_users INTEGER DEFAULT 0,
    new_licenses INTEGER DEFAULT 0,
    license_validations INTEGER DEFAULT 0,
    version_checks INTEGER DEFAULT 0,
    app_sessions INTEGER DEFAULT 0,
    total_session_duration INTEGER DEFAULT 0,
    countries JSONB,
    versions JSONB,
    license_types JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_licenses_device_fingerprint ON licenses(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_licenses_unlock_code ON licenses(unlock_code);
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_expires_at ON licenses(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_license_id ON sessions(license_id);
CREATE INDEX IF NOT EXISTS idx_sessions_device_fingerprint ON sessions(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_event_type ON usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_created_at ON usage_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_version_checks_created_at ON version_checks(created_at);
CREATE INDEX IF NOT EXISTS idx_license_validations_created_at ON license_validations(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Create triggers for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_versions_updated_at BEFORE UPDATE ON versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    TO authenticated
    USING (role IN ('super_admin', 'admin'));

-- RLS Policies for versions table (public read for active versions)
CREATE POLICY "Public can view active versions"
    ON versions FOR SELECT
    USING (active = true);

CREATE POLICY "Authenticated users can manage versions"
    ON versions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policies for licenses table
CREATE POLICY "Users can view own licenses"
    ON licenses FOR SELECT
    TO authenticated
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Authenticated users can manage licenses"
    ON licenses FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policies for sessions table
CREATE POLICY "Authenticated users can view sessions"
    ON sessions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage sessions"
    ON sessions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policies for analytics (authenticated access)
CREATE POLICY "Authenticated users can view analytics"
    ON usage_analytics FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert analytics"
    ON usage_analytics FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policies for version checks (public insert, authenticated read)
CREATE POLICY "Public can insert version checks"
    ON version_checks FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view version checks"
    ON version_checks FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for license validations
CREATE POLICY "Public can insert license validations"
    ON license_validations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authenticated users can view license validations"
    ON license_validations FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for daily stats (authenticated read only)
CREATE POLICY "Authenticated users can view daily stats"
    ON daily_stats FOR SELECT
    TO authenticated
    USING (true);
