/*
  # Fix database schema
  
  1. Tables
    - prospects: Store prospect information and follow-up status
    - templates: Store email templates for different follow-up stages
    - history: Track email history
    - settings: Store user settings and preferences
  
  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
*/

-- Create tables
CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  project text,
  first_contact date NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  followup_stage int NOT NULL DEFAULT 1,
  next_followup date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  stage int NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES prospects ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES templates ON DELETE SET NULL,
  sent_at timestamptz DEFAULT now(),
  status text NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  api_key text UNIQUE DEFAULT gen_random_uuid(),
  followup_timing jsonb DEFAULT '{"1": 3, "2": 7, "3": 14}'::jsonb,
  email_provider text DEFAULT 'sendgrid',
  email_api_key text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies safely
DO $$ 
BEGIN
  -- Prospects policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'prospects' AND policyname = 'Users can manage their own prospects'
  ) THEN
    CREATE POLICY "Users can manage their own prospects"
      ON prospects FOR ALL
      USING (auth.uid() = user_id);
  END IF;

  -- Templates policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'templates' AND policyname = 'Users can manage their own templates'
  ) THEN
    CREATE POLICY "Users can manage their own templates"
      ON templates FOR ALL
      USING (auth.uid() = user_id);
  END IF;

  -- History policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'history' AND policyname = 'Users can view history of their prospects'
  ) THEN
    CREATE POLICY "Users can view history of their prospects"
      ON history FOR ALL
      USING (EXISTS (
        SELECT 1 FROM prospects
        WHERE prospects.id = history.prospect_id
        AND prospects.user_id = auth.uid()
      ));
  END IF;

  -- Settings policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'settings' AND policyname = 'Users can manage their own settings'
  ) THEN
    CREATE POLICY "Users can manage their own settings"
      ON settings FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create function and trigger for new user settings
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();