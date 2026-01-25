-- Add jewelry_type column to vessels
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS jewelry_type TEXT CHECK (jewelry_type IN ('ring', 'necklace', 'bracelet')) DEFAULT 'necklace';
