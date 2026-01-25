import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProfile(id: string) {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new NotFoundException('Profile not found');

    return data;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const client = this.supabase.getClient();
    
    // First ensure profile exists (it should due to trigger, but good to check)
    const { data: existing } = await client
      .from('profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      await client.from('profiles').insert([{ id }]);
    }

    const { data, error } = await client
      .from('profiles')
      .update({
        full_name: updateProfileDto.fullName,
        avatar_url: updateProfileDto.avatarUrl,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
