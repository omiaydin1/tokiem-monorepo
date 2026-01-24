import { IsString, IsNotEmpty, IsIn, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemoryDto {
  @ApiProperty({ example: 'https://supabase.co/storage/v1/object/public/memories/uuid/file.mp4' })
  @IsUrl()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiProperty({ enum: ['video', 'audio'], example: 'video' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['video', 'audio'])
  mediaType: 'video' | 'audio';

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  gifterName: string;

  @ApiProperty({ example: 'Happy birthday!', required: false })
  @IsString()
  @IsOptional()
  noteText?: string;
}
