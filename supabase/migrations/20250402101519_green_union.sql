/*
  # Add prospect scheduling function and trigger

  1. New Function
    - `handle_prospect_scheduling`
      - Triggered after prospect insert/update
      - Calculates next follow-up date based on user settings
      - Updates prospect with follow-up schedule

  2. Changes
    - Add trigger on prospects table
    - Add default follow-up timing to settings if not exists
*/

-- Create function to handle prospect scheduling
CREATE OR REPLACE FUNCTION handle_prospect_scheduling()
RETURNS TRIGGER AS $$
DECLARE
  user_settings RECORD;
  next_followup_days INTEGER;
BEGIN
  -- Get user settings
  SELECT followup_timing
  INTO user_settings
  FROM settings
  WHERE user_id = NEW.user_id;

  -- If no settings found, use default timing
  IF user_settings IS NULL THEN
    -- Insert default settings
    INSERT INTO settings (
      user_id,
      followup_timing
    ) VALUES (
      NEW.user_id,
      '{"1": 3, "2": 7, "3": 14}'::jsonb
    )
    RETURNING followup_timing INTO user_settings;
  END IF;

  -- Get days for current follow-up stage
  next_followup_days := (user_settings.followup_timing->>NEW.followup_stage::text)::integer;

  -- Update next follow-up date
  NEW.next_followup := NEW.first_contact + (next_followup_days || ' days')::interval;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prospects_scheduling_trigger ON prospects;

-- Create trigger for prospect scheduling
CREATE TRIGGER prospects_scheduling_trigger
  BEFORE INSERT OR UPDATE OF followup_stage
  ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION handle_prospect_scheduling();

-- Ensure settings table has followup_timing for existing users
UPDATE settings 
SET followup_timing = '{"1": 3, "2": 7, "3": 14}'::jsonb 
WHERE followup_timing IS NULL;