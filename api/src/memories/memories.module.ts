import { Module } from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { MemoriesController } from './memories.controller';
import { VesselsModule } from '../vessels/vessels.module';

@Module({
  imports: [VesselsModule],
  controllers: [MemoriesController],
  providers: [MemoriesService],
})
export class MemoriesModule {}
