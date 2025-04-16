/*
  # Add email templates

  1. New Tables
    - `templates`: Stores email templates
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `stage` (integer)
      - `subject` (text)
      - `body` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `templates` table
    - Add policy for authenticated users to manage their own templates
*/

-- Create templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  stage integer NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can manage their own templates" ON templates;
  
  CREATE POLICY "Users can manage their own templates"
    ON templates FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Add unique constraint for user_id and stage if it doesn't exist
DO $$
BEGIN
  ALTER TABLE templates
  ADD CONSTRAINT templates_user_id_stage_key UNIQUE (user_id, stage);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;