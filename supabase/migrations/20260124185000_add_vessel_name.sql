-- Add name column to vessels
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS name TEXT;
