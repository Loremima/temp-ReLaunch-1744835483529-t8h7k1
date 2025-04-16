/*
  # Scheduling and Contact Management System

  1. New Tables
    - `meetings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `prospect_id` (uuid, foreign key to prospects, nullable)
      - `title` (text)
      - `description` (text, nullable)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `is_recurring` (boolean)
      - `recurrence_rule` (text, nullable) - iCal RRule format
      - `meeting_link` (text, nullable)
      - `calendar_provider` (text) - 'google' or 'outlook'
      - `calendar_event_id` (text, nullable)
      - `reminder_sent` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `availability`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `day_of_week` (integer) - 0-6 for Sunday-Saturday
      - `start_time` (time)
      - `end_time` (time)
      - `created_at` (timestamptz)

    - `meeting_types`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `duration` (integer) - minutes
      - `buffer_before` (integer) - minutes
      - `buffer_after` (integer) - minutes
      - `color` (text) - hex color
      - `created_at` (timestamptz)

    - `contact_tags`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `color` (text)
      - `created_at` (timestamptz)

    - `prospect_tags`
      - `prospect_id` (uuid, foreign key to prospects)
      - `tag_id` (uuid, foreign key to contact_tags)
      - Primary key (prospect_id, tag_id)

    - `prospect_notes`
      - `id` (uuid, primary key)
      - `prospect_id` (uuid, foreign key to prospects)
      - `user_id` (uuid, foreign key to users)
      - `content` (text)
      - `is_pinned` (boolean)
      - `created_at` (timestamptz)

    - `custom_fields`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `type` (text) - 'text', 'number', 'date', 'select'
      - `options` (jsonb, nullable) - for select type
      - `created_at` (timestamptz)

    - `prospect_custom_fields`
      - `prospect_id` (uuid, foreign key to prospects)
      - `field_id` (uuid, foreign key to custom_fields)
      - `value` (text)
      - Primary key (prospect_id, field_id)

  2. Table Modifications
    - Add to `prospects`:
      - `company` (text, nullable)
      - `source` (text, nullable)
      - `custom_data` (jsonb, nullable)

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
*/

-- Modify prospects table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prospects' AND column_name = 'company'
  ) THEN
    ALTER TABLE prospects ADD COLUMN company text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prospects' AND column_name = 'source'
  ) THEN
    ALTER TABLE prospects ADD COLUMN source text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prospects' AND column_name = 'custom_data'
  ) THEN
    ALTER TABLE prospects ADD COLUMN custom_data jsonb;
  END IF;
END $$;

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  prospect_id uuid REFERENCES prospects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_recurring boolean DEFAULT false,
  recurrence_rule text,
  meeting_link text,
  calendar_provider text NOT NULL,
  calendar_event_id text,
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_prospect_id ON meetings(prospect_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, day_of_week, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_user_id ON availability(user_id);

-- Create meeting_types table
CREATE TABLE IF NOT EXISTS meeting_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  buffer_before integer DEFAULT 0,
  buffer_after integer DEFAULT 0,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_types_user_id ON meeting_types(user_id);

-- Create contact_tags table
CREATE TABLE IF NOT EXISTS contact_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_contact_tags_user_id ON contact_tags(user_id);

-- Create prospect_tags table
CREATE TABLE IF NOT EXISTS prospect_tags (
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES contact_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (prospect_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_prospect_tags_prospect_id ON prospect_tags(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_tags_tag_id ON prospect_tags(tag_id);

-- Create prospect_notes table
CREATE TABLE IF NOT EXISTS prospect_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospect_notes_prospect_id ON prospect_notes(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_notes_user_id ON prospect_notes(user_id);

-- Create custom_fields table
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'number', 'date', 'select')),
  options jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_user_id ON custom_fields(user_id);

-- Create prospect_custom_fields table
CREATE TABLE IF NOT EXISTS prospect_custom_fields (
  prospect_id uuid REFERENCES prospects(id) ON DELETE CASCADE,
  field_id uuid REFERENCES custom_fields(id) ON DELETE CASCADE,
  value text NOT NULL,
  PRIMARY KEY (prospect_id, field_id)
);

CREATE INDEX IF NOT EXISTS idx_prospect_custom_fields_prospect_id ON prospect_custom_fields(prospect_id);
CREATE INDEX IF NOT EXISTS idx_prospect_custom_fields_field_id ON prospect_custom_fields(field_id);

-- Enable Row Level Security
DO $$ 
BEGIN
  ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
  ALTER TABLE meeting_types ENABLE ROW LEVEL SECURITY;
  ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE prospect_tags ENABLE ROW LEVEL SECURITY;
  ALTER TABLE prospect_notes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
  ALTER TABLE prospect_custom_fields ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can manage their own meetings" ON meetings;
  DROP POLICY IF EXISTS "Users can manage their own availability" ON availability;
  DROP POLICY IF EXISTS "Users can manage their own meeting types" ON meeting_types;
  DROP POLICY IF EXISTS "Users can manage their own tags" ON contact_tags;
  DROP POLICY IF EXISTS "Users can manage tags for their prospects" ON prospect_tags;
  DROP POLICY IF EXISTS "Users can manage notes for their prospects" ON prospect_notes;
  DROP POLICY IF EXISTS "Users can manage their own custom fields" ON custom_fields;
  DROP POLICY IF EXISTS "Users can manage custom fields for their prospects" ON prospect_custom_fields;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create policies
CREATE POLICY "Users can manage their own meetings"
  ON meetings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own availability"
  ON availability FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own meeting types"
  ON meeting_types FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tags"
  ON contact_tags FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage tags for their prospects"
  ON prospect_tags FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM prospects
    WHERE prospects.id = prospect_tags.prospect_id
    AND prospects.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage notes for their prospects"
  ON prospect_notes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own custom fields"
  ON custom_fields FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage custom fields for their prospects"
  ON prospect_custom_fields FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM prospects
    WHERE prospects.id = prospect_custom_fields.prospect_id
    AND prospects.user_id = auth.uid()
  ));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;

-- Add updated_at trigger
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();