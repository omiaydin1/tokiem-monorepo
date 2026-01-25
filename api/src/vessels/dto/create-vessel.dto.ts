import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVesselDto {
  @ApiProperty({ example: 'V12345', description: 'The unique tag ID of the vessel' })
  @IsString()
  @IsNotEmpty()
  tagId: string;

  @ApiProperty({ example: 'necklace', enum: ['ring', 'necklace', 'bracelet'], required: false })
  @IsString()
  @IsOptional()
  jewelryType?: 'ring' | 'necklace' | 'bracelet';
}
