/*
  # Add name column to templates table

  1. Changes
    - Add `name` column to `templates` table with default value based on subject
    - Update existing rows to set name from subject
    - Make name column NOT NULL after setting defaults

  2. Security
    - No changes to RLS policies needed
*/

-- First add the column as nullable
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS name text;

-- Update existing rows to set name from subject
UPDATE templates 
SET name = subject 
WHERE name IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE templates 
ALTER COLUMN name SET NOT NULL;