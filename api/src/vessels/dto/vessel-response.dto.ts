import { ApiProperty } from '@nestjs/swagger';

export class VesselResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'V12345' })
  tag_id: string;

  @ApiProperty({ example: '2024-01-24T12:00:00Z' })
  created_at: string;
}
