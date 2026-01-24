import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseStrategy } from './supabase.strategy';
import { PassportModule } from '@nestjs/passport';

@Global()
@Module({
  imports: [PassportModule],
  providers: [SupabaseService, SupabaseStrategy],
  exports: [SupabaseService],
})
export class SupabaseModule {}
