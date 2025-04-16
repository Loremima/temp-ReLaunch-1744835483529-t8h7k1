/*
  # Add History Insert Function
  
  1. Changes
    - Create function to insert history records
    - Function handles prospect_id, template_id, and status
    - Automatically sets sent_at timestamp
    - Includes user_id from prospects table
  
  2. Security
    - Function inherits caller's permissions
    - Relies on RLS policies for access control
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS insert_history(UUID, UUID, TEXT);

-- Create function with user_id parameter
CREATE OR REPLACE FUNCTION insert_history(
  p_prospect_id UUID,
  p_template_id UUID,
  p_status TEXT
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id from prospects table
  SELECT user_id INTO v_user_id
  FROM prospects
  WHERE id = p_prospect_id;

  -- Insert history record with user_id
  INSERT INTO history (
    prospect_id,
    template_id,
    user_id,
    sent_at,
    status
  )
  VALUES (
    p_prospect_id,
    p_template_id,
    v_user_id,
    NOW(),
    p_status
  );
END;
$$ LANGUAGE plpgsql;