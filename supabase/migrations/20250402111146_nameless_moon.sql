/*
  # Add email uniqueness and validation

  1. Changes
    - Clean up invalid and duplicate email addresses
    - Add unique constraint for email
    - Add check constraint for email format validation
    - Add trigger for email validation

  2. Security
    - Maintains existing RLS policies
*/

-- First, create a temporary table to store the original emails
CREATE TEMP TABLE temp_emails AS
SELECT id, email, created_at
FROM prospects
WHERE email IS NOT NULL;

-- Update invalid emails with a unique suffix
WITH invalid_emails AS (
  SELECT id, email,
    ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM prospects
  WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
)
UPDATE prospects p
SET email = p.email || '.invalid-' || ie.rn
FROM invalid_emails ie
WHERE p.id = ie.id;

-- Handle duplicate emails by appending a unique suffix
WITH duplicates AS (
  SELECT id, email,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at) as rn
  FROM prospects
  WHERE email IN (
    SELECT email
    FROM prospects
    GROUP BY email
    HAVING COUNT(*) > 1
  )
)
UPDATE prospects p
SET email = CASE 
  WHEN d.rn > 1 THEN p.email || '-' || d.rn 
  ELSE p.email
END
FROM duplicates d
WHERE p.id = d.id;

-- Update any remaining invalid emails to ensure they match the pattern
UPDATE prospects
SET email = REGEXP_REPLACE(
  email,
  '[^A-Za-z0-9._%+-@]',
  '-',
  'g'
)
WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

-- Now add the constraints
ALTER TABLE prospects
ADD CONSTRAINT prospects_email_unique UNIQUE (email);

ALTER TABLE prospects
ADD CONSTRAINT prospects_email_check CHECK (
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Create function to check for duplicate emails
CREATE OR REPLACE FUNCTION check_duplicate_email()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM prospects 
    WHERE email = NEW.email 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Email address already exists';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for duplicate email check
CREATE TRIGGER check_duplicate_email_trigger
  BEFORE INSERT OR UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_email();