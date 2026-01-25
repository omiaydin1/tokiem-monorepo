-- Make gifter_name nullable in memories table
ALTER TABLE memories ALTER COLUMN gifter_name DROP NOT NULL;
