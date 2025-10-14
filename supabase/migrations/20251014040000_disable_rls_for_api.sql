/*
  # Disable RLS for API Access

  ## Changes
  This migration disables Row Level Security for all tables to allow the NestJS API
  to manage authorization at the application level using JWT authentication.

  The NestJS API uses custom JWT tokens with Passport strategy, which operates independently
  from Supabase's auth.uid() system. Authorization is handled in the application layer
  through guards and role-based access control.

  ## Security Notes
  - Application-level authorization is enforced via NestJS guards
  - JWT tokens validate user identity and roles
  - Database access is restricted to the API service
  - Direct database access requires service role key
*/

-- Disable RLS on all tables to allow API access
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE version_checks DISABLE ROW LEVEL SECURITY;
ALTER TABLE license_validations DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE version_files DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Public can view active versions" ON versions;
DROP POLICY IF EXISTS "Authenticated users can manage versions" ON versions;
DROP POLICY IF EXISTS "Users can view own licenses" ON licenses;
DROP POLICY IF EXISTS "Authenticated users can manage licenses" ON licenses;
DROP POLICY IF EXISTS "Authenticated users can view sessions" ON sessions;
DROP POLICY IF EXISTS "Authenticated users can manage sessions" ON sessions;
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON usage_analytics;
DROP POLICY IF EXISTS "Authenticated users can insert analytics" ON usage_analytics;
DROP POLICY IF EXISTS "Public can insert version checks" ON version_checks;
DROP POLICY IF EXISTS "Authenticated users can view version checks" ON version_checks;
DROP POLICY IF EXISTS "Public can insert license validations" ON license_validations;
DROP POLICY IF EXISTS "Authenticated users can view license validations" ON license_validations;
DROP POLICY IF EXISTS "Authenticated users can view daily stats" ON daily_stats;
DROP POLICY IF EXISTS "Public can view active version files" ON version_files;
DROP POLICY IF EXISTS "Authenticated users can view all version files" ON version_files;
DROP POLICY IF EXISTS "Authenticated users can insert version files" ON version_files;
DROP POLICY IF EXISTS "Authenticated users can update version files" ON version_files;
DROP POLICY IF EXISTS "Authenticated users can delete version files" ON version_files;
