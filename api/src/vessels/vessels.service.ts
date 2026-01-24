import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateVesselDto } from './dto/create-vessel.dto';

@Injectable()
export class VesselsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findByTagId(tagId: string) {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('vessels')
      .select('*')
      .eq('tag_id', tagId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Vessel with tag_id ${tagId} not found`);
    }

    return data;
  }

  async create(createVesselDto: CreateVesselDto) {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('vessels')
      .insert([
        {
          tag_id: createVesselDto.tagId,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
