import { ApiProperty } from '@nestjs/swagger';

export class MemoryResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  vessel_id: string;

  @ApiProperty({ example: 'https://supabase.co/storage/v1/object/public/memories/uuid/file.mp4' })
  media_url: string;

  @ApiProperty({ enum: ['video', 'audio'], example: 'video' })
  media_type: 'video' | 'audio';

  @ApiProperty({ example: 'John Doe' })
  gifter_name: string;

  @ApiProperty({ example: 'Happy birthday!', nullable: true })
  note_text: string | null;

  @ApiProperty({ example: '2024-01-24T12:00:00Z' })
  created_at: string;
}
