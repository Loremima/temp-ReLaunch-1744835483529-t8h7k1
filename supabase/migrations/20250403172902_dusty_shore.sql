-- First, clean up duplicate prospects by keeping only the latest one
WITH duplicates AS (
  SELECT 
    id,
    user_id,
    email,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, email 
      ORDER BY created_at DESC
    ) as rn
  FROM prospects
)
DELETE FROM prospects p
USING duplicates d
WHERE p.id = d.id 
AND d.rn > 1;

-- Add unique constraint for email per user if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'prospects_user_id_email_key'
  ) THEN
    ALTER TABLE prospects
    ADD CONSTRAINT prospects_user_id_email_key UNIQUE (user_id, email);
  END IF;
END $$;

-- Add check constraint for valid stages if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'prospects_followup_stage_check'
  ) THEN
    ALTER TABLE prospects
    ADD CONSTRAINT prospects_followup_stage_check 
    CHECK (followup_stage >= 0 AND followup_stage <= 3);
  END IF;
END $$;

-- Create function to calculate next follow-up date
CREATE OR REPLACE FUNCTION calculate_next_followup(
  p_first_contact date,
  p_stage integer,
  p_followup_timing jsonb
)
RETURNS date AS $$
DECLARE
  v_days integer;
BEGIN
  -- Get days for the stage from followup_timing
  v_days := (p_followup_timing->>(p_stage::text))::integer;
  
  -- Return calculated date
  RETURN p_first_contact + (v_days * interval '1 day');
END;
$$ LANGUAGE plpgsql;

-- Create function to handle stage progression
CREATE OR REPLACE FUNCTION handle_stage_progression()
RETURNS TRIGGER AS $$
DECLARE
  v_settings record;
BEGIN
  -- Get user settings
  SELECT followup_timing
  INTO v_settings
  FROM settings
  WHERE user_id = NEW.user_id;

  -- If settings not found, use defaults
  IF v_settings IS NULL THEN
    v_settings := row(('{"1": 3, "2": 7, "3": 14}'::jsonb));
  END IF;

  -- Calculate next follow-up date based on stage
  IF NEW.followup_stage > 0 AND NEW.followup_stage <= 3 THEN
    NEW.next_followup := calculate_next_followup(
      NEW.first_contact,
      NEW.followup_stage,
      v_settings.followup_timing
    );
  END IF;

  -- Set status based on stage
  IF NEW.followup_stage > 3 THEN
    NEW.status := 'Completed';
    NEW.next_followup := NULL;
  ELSIF NEW.status IS NULL OR NEW.status = '' THEN
    NEW.status := 'Pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stage progression
DROP TRIGGER IF EXISTS handle_stage_progression_trigger ON prospects;
CREATE TRIGGER handle_stage_progression_trigger
  BEFORE INSERT OR UPDATE OF followup_stage
  ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION handle_stage_progression();

-- Fix history records with stage 0
UPDATE history h
SET template_id = t.id
FROM templates t
WHERE h.template_id IS NULL
AND t.stage = 1
AND t.user_id = h.user_id;

-- Create function to update prospect stage after email
CREATE OR REPLACE FUNCTION update_prospect_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update prospect stage and status
  UPDATE prospects
  SET 
    followup_stage = CASE 
      WHEN followup_stage IS NULL THEN 1
      WHEN followup_stage < 3 THEN followup_stage + 1
      ELSE followup_stage
    END
  WHERE id = NEW.prospect_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update prospect stage after email
DROP TRIGGER IF EXISTS update_prospect_stage_trigger ON history;
CREATE TRIGGER update_prospect_stage_trigger
  AFTER INSERT
  ON history
  FOR EACH ROW
  EXECUTE FUNCTION update_prospect_stage();