
-- Add email field to admin_users table for easier reference
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS email TEXT;

-- Create an index on the email field for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Update any existing records to have their email values if possible
-- This is a placeholder - in a real scenario we'd need to look up emails from auth.users
-- but that requires elevated permissions
