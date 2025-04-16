/*
  # Core Schema Migration
  
  1. Tables
    - prospects: Store prospect information
    - templates: Store email templates
    - history: Track email history
    - settings: Store user settings
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tables if they don't exist
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prospects_next_followup ON prospects(next_followup);
CREATE INDEX IF NOT EXISTS idx_prospects_user_id ON prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_history_prospect_id ON history(prospect_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);

-- Enable Row Level Security
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
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Templates policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'templates' AND policyname = 'Users can manage their own templates'
    ) THEN
        CREATE POLICY "Users can manage their own templates"
            ON templates FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- History policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'history' AND policyname = 'Users can view history of their prospects'
    ) THEN
        CREATE POLICY "Users can view history of their prospects"
            ON history FOR ALL
            TO authenticated
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
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers safely
DO $$
BEGIN
    -- Prospects updated_at trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_prospects_updated_at'
    ) THEN
        CREATE TRIGGER update_prospects_updated_at
            BEFORE UPDATE ON prospects
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Settings updated_at trigger
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_settings_updated_at'
    ) THEN
        CREATE TRIGGER update_settings_updated_at
            BEFORE UPDATE ON settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create function for new user settings
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO settings (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user settings safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION handle_new_user();
    END IF;
END $$;
