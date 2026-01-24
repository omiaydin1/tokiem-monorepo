-- Add sender_id to vessels
ALTER TABLE vessels ADD COLUMN sender_id UUID REFERENCES auth.users(id);

-- Allow anyone to read vessels (already exists, but good to be explicit)
-- CREATE POLICY "Public read vessels" ON vessels FOR SELECT USING (true);

-- Allow authenticated users to claim a vessel if it has no sender
CREATE POLICY "Users can claim unowned vessels" ON vessels
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND sender_id IS NULL)
  WITH CHECK (auth.role() = 'authenticated');

-- Allow senders to manage their vessels
CREATE POLICY "Senders can manage their vessels" ON vessels
  FOR ALL
  USING (auth.uid() = sender_id);
