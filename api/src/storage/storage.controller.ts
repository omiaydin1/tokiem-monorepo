import { Controller, Post, Body } from '@nestjs/common';
import { StorageService } from './storage.service';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { PresignedUrlResponse } from './dto/presigned-url-response.dto';

@ApiTags('Storage')
@Controller('upload')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Create a presigned upload URL' })
  @ApiResponse({ status: 201, type: PresignedUrlResponse })
  async createPresignedUrl(@Body() dto: CreatePresignedUrlDto) {
    return this.storageService.createPresignedUrl(dto.fileName);
  }
}
