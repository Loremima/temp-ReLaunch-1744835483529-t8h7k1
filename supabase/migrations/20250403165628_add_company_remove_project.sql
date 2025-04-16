-- Remove project column and add company column
ALTER TABLE prospects DROP COLUMN IF EXISTS project;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS company text; 