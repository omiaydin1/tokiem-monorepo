import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SupabaseAuthGuard } from '../supabase/supabase-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Request() req) {
    return this.profilesService.getProfile(req.user.id);
  }

  @Post('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profile by ID' })
  getProfile(@Param('id') id: string) {
    return this.profilesService.getProfile(id);
  }
}
