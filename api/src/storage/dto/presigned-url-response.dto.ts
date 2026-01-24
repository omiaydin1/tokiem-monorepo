import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResponse {
  @ApiProperty({ example: 'https://supabase.co/storage/v1/s3/memories/uuid/file.mp4?token=...' })
  uploadUrl: string;

  @ApiProperty({ example: 'https://supabase.co/storage/v1/object/public/memories/uuid/file.mp4' })
  publicUrl: string;
}
