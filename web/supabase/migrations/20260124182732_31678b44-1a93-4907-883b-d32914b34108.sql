-- Create vessels table
CREATE TABLE vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create memories table
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES vessels(id) NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(50) NOT NULL,
  gifter_name VARCHAR(255) NOT NULL,
  note_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Public read access for vessels
CREATE POLICY "Public read vessels" ON vessels FOR SELECT USING (true);

-- Public read access for memories
CREATE POLICY "Public read memories" ON memories FOR SELECT USING (true);

-- Public insert access for memories
CREATE POLICY "Public insert memories" ON memories FOR INSERT WITH CHECK (true);

-- Create storage bucket for memories
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('memories', 'memories', true, 104857600, ARRAY['video/webm', 'video/mp4', 'audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav']);

-- Storage policies for public upload and read
CREATE POLICY "Public upload memories" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memories');
CREATE POLICY "Public read memories" ON storage.objects FOR SELECT USING (bucket_id = 'memories');