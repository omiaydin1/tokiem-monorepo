import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { VesselsService } from './vessels.service';
import { CreateVesselDto } from './dto/create-vessel.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { VesselResponse } from './dto/vessel-response.dto';

@ApiTags('Vessels')
@Controller('vessels')
export class VesselsController {
  constructor(private readonly vesselsService: VesselsService) {}

  @Get(':tagId')
  @ApiOperation({ summary: 'Get vessel by tag ID' })
  @ApiResponse({ status: 200, type: VesselResponse })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  findOne(@Param('tagId') tagId: string) {
    return this.vesselsService.findByTagId(tagId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new vessel' })
  @ApiResponse({ status: 201, type: VesselResponse })
  create(@Body() createVesselDto: CreateVesselDto) {
    return this.vesselsService.create(createVesselDto);
  }
}
