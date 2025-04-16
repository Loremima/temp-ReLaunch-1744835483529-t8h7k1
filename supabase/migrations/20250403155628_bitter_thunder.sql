/*
  # Follow-up System Schema

  1. New Tables
    - `prospects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text)
      - `project` (text)
      - `first_contact` (date)
      - `status` (text)
      - `followup_stage` (int)
      - `next_followup` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `stage` (int)
      - `subject` (text)
      - `body` (text)
      - `created_at` (timestamp)

    - `history`
      - `id` (uuid, primary key)
      - `prospect_id` (uuid, references prospects)
      - `template_id` (uuid, references templates)
      - `sent_at` (timestamp)
      - `status` (text)

    - `settings`
      - `user_id` (uuid, primary key, references auth.users)
      - `api_key` (text)
      - `followup_timing` (jsonb)
      - `email_provider` (text)
      - `email_api_key` (text)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS history CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS prospects CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Create tables in correct order
CREATE TABLE prospects (
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

CREATE TABLE templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    stage int NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id uuid REFERENCES prospects ON DELETE CASCADE NOT NULL,
    template_id uuid REFERENCES templates ON DELETE SET NULL,
    sent_at timestamptz DEFAULT now(),
    status text NOT NULL
);

CREATE TABLE settings (
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own prospects" ON prospects;
DROP POLICY IF EXISTS "Users can manage their own templates" ON templates;
DROP POLICY IF EXISTS "Users can view history of their prospects" ON history;
DROP POLICY IF EXISTS "Users can manage their own settings" ON settings;

-- Create policies
CREATE POLICY "Users can manage their own prospects"
    ON prospects FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own templates"
    ON templates FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view history of their prospects"
    ON history FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM prospects
        WHERE prospects.id = history.prospect_id
        AND prospects.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own settings"
    ON settings FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_prospects_updated_at ON prospects;
CREATE TRIGGER update_prospects_updated_at
    BEFORE UPDATE ON prospects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for new user settings
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO settings (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user settings
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();