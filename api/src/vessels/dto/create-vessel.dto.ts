import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVesselDto {
  @ApiProperty({ example: 'V12345', description: 'The unique tag ID of the vessel' })
  @IsString()
  @IsNotEmpty()
  tagId: string;
}
