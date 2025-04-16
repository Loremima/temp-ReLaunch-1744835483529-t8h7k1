-- Create a table for storing scheduled job execution logs
CREATE TABLE scheduled_job_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type TEXT NOT NULL,
  results JSONB NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy to allow authenticated users to read logs
ALTER TABLE scheduled_job_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read logs" ON scheduled_job_logs
  FOR SELECT USING (auth.role() = 'authenticated');
  
-- Create an index for faster queries
CREATE INDEX idx_scheduled_job_logs_job_type ON scheduled_job_logs(job_type);
CREATE INDEX idx_scheduled_job_logs_executed_at ON scheduled_job_logs(executed_at);

-- Add column is_active to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END
$$; 