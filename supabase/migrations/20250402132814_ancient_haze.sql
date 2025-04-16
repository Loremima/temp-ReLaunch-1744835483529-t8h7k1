/*
  # Add Email Provider Settings

  1. Changes
    - Add email provider settings to settings table
    - Set default values for new users
    - Add validation for email provider type

  2. Security
    - Maintain existing RLS policies
*/

-- Add email provider columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'settings' AND column_name = 'email_provider'
  ) THEN
    ALTER TABLE settings 
    ADD COLUMN email_provider text DEFAULT 'sendgrid'::text,
    ADD COLUMN email_api_key text,
    ADD CONSTRAINT email_provider_check CHECK (email_provider IN ('sendgrid', 'mailersend'));
  END IF;
END $$;

-- Create default settings for existing users
INSERT INTO settings (user_id, email_provider)
SELECT id, 'sendgrid' 
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM settings)
ON CONFLICT (user_id) DO NOTHING;