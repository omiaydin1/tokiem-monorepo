# Tokiem API

NestJS backend for Tokiem.

## 🚀 Quick Start

1. **Install dependencies**: `yarn`
2. **Setup environment**: Copy `.env.example` to `.env` and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.
3. **Run the app**: `yarn start:dev`

## 📚 Documentation

The API documentation is available at the private link:
`http://localhost:3000/docs-private-8822`

## 🛠 Modules

### 🚢 Vessels
- `GET /vessels/:tagId` - Get vessel details by its tag ID.
- `POST /vessels` - Register a new vessel.

### 🧠 Memories
- `GET /vessels/:tagId/memory` - Get the memory associated with a vessel.
- `POST /vessels/:tagId/memory` - Create a memory for a vessel (one per vessel).

### ☁️ Storage
- `POST /upload/presign` - Get a signed upload URL to upload media directly to Supabase.

## 🗄 Database (Supabase)

The following tables are expected in Supabase:

### `vessels`
- `id` (uuid, pk)
- `tag_id` (text, unique)
- `created_at` (timestamp)

### `memories`
- `id` (uuid, pk)
- `vessel_id` (uuid, fk -> vessels.id)
- `media_url` (text)
- `media_type` (text: 'video' | 'audio')
- `gifter_name` (text)
- `note_text` (text, nullable)
- `created_at` (timestamp)

### Storage Bucket
- `memories` (public bucket)
