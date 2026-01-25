import { Module } from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { MemoriesController } from './memories.controller';
import { VesselsModule } from '../vessels/vessels.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [VesselsModule, ProfilesModule],
  controllers: [MemoriesController],
  providers: [MemoriesService],
})
export class MemoriesModule {}
