/*
  # Add user_id to history table

  1. Changes
    - Add `user_id` column to history table
    - Add foreign key constraint to auth.users
    - Add index for faster lookups
    - Update RLS policy to use user_id

  2. Security
    - Update RLS policy to use user_id instead of prospect lookup
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'history' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE history ADD COLUMN user_id uuid REFERENCES auth.users(id) NOT NULL;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view history of their prospects" ON history;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policy using user_id
CREATE POLICY "Users can view their own history"
  ON history FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update existing history entries to set user_id from prospects
UPDATE history h
SET user_id = p.user_id
FROM prospects p
WHERE h.prospect_id = p.id
AND h.user_id IS NULL;