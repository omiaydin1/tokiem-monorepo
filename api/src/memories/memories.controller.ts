import { Controller, Get, Post, Body, Param, Res, UseGuards, Req } from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { Response } from 'express';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MemoryResponse } from './dto/memory-response.dto';
import { SupabaseAuthGuard } from '../supabase/supabase-auth.guard';

@ApiTags('Memories')
@Controller('vessels/:tagId/memory')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get memory by vessel tag ID' })
  @ApiResponse({ status: 200, type: MemoryResponse })
  @ApiResponse({ status: 204, description: 'No memory found' })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  findOne(@Param('tagId') tagId: string, @Res() res: Response) {
    return this.memoriesService.getMemoryByTagId(tagId, res);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create memory for a vessel' })
  @ApiResponse({ status: 201, type: MemoryResponse })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  @ApiResponse({ status: 409, description: 'Vessel already has a memory or unauthorized' })
  create(
    @Param('tagId') tagId: string,
    @Body() createMemoryDto: CreateMemoryDto,
    @Req() req: any,
  ) {
    return this.memoriesService.create(tagId, createMemoryDto, req.user.id);
  }
}
