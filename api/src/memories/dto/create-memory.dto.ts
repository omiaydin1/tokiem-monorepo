import { IsString, IsNotEmpty, IsIn, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemoryDto {
  @ApiProperty({ example: 'https://supabase.co/storage/v1/object/public/memories/uuid/file.mp4' })
  @IsUrl()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiProperty({ enum: ['video', 'audio', 'image'], example: 'video' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['video', 'audio', 'image'])
  mediaType: 'video' | 'audio' | 'image';

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  gifterName?: string;

  @ApiProperty({ example: 'Happy birthday!', required: false })
  @IsString()
  @IsOptional()
  noteText?: string;

  @ApiProperty({ example: 'My First Vessel', required: false })
  @IsString()
  @IsOptional()
  vesselName?: string;
}
