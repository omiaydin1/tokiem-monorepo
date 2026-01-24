import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VesselsService } from './vessels.service';
import { CreateVesselDto } from './dto/create-vessel.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { VesselResponse } from './dto/vessel-response.dto';
import { SupabaseAuthGuard } from '../supabase/supabase-auth.guard';

@ApiTags('Vessels')
@Controller('vessels')
export class VesselsController {
  constructor(private readonly vesselsService: VesselsService) {}

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Get all vessels claimed by the current user' })
  @ApiResponse({ status: 200, type: [VesselResponse] })
  findAll(@Request() req) {
    return this.vesselsService.findAllBySenderId(req.user.sub);
  }

  @Get(':tagId')
  @ApiOperation({ summary: 'Get vessel by tag ID' })
  @ApiResponse({ status: 200, type: VesselResponse })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  findOne(@Param('tagId') tagId: string) {
    return this.vesselsService.findByTagId(tagId);
  }

  @Post(':tagId/claim')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Claim a vessel as a sender' })
  @ApiResponse({ status: 200, type: VesselResponse })
  claim(@Param('tagId') tagId: string, @Request() req) {
    return this.vesselsService.claim(tagId, req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new vessel' })
  @ApiResponse({ status: 201, type: VesselResponse })
  create(@Body() createVesselDto: CreateVesselDto) {
    return this.vesselsService.create(createVesselDto);
  }
}
