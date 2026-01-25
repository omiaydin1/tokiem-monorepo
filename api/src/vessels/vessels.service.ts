import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`Vessel with tag_id ${tagId} not found`);
    }

    return data;
  }

  async updateName(tagId: string, name: string, userId: string) {
    const vessel = await this.findByTagId(tagId);
    
    if (vessel.sender_id && vessel.sender_id !== userId) {
      throw new ConflictException('Only the sender can update the vessel name');
    }

    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('vessels')
      .update({ name })
      .eq('tag_id', tagId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findAllBySenderId(senderId: string) {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('vessels')
      .select('*, memories(count)')
      .eq('sender_id', senderId);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(vessel => ({
      ...vessel,
      memory_count: vessel.memories?.[0]?.count || 0
    }));
  }

  async claim(tagId: string, userId: string) {
    const vessel = await this.findByTagId(tagId);

    if (vessel.sender_id) {
      if (vessel.sender_id === userId) {
        return vessel;
      }
      throw new ConflictException('Vessel is already claimed by another user');
    }

    const client = this.supabase.getClient();
    
    const { data, error } = await client
      .from('vessels')
      .update({ sender_id: userId })
      .eq('tag_id', tagId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      return data[0];
    }

    return this.findByTagId(tagId);
  }

  async create(createVesselDto: CreateVesselDto) {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('vessels')
      .insert([
        {
          tag_id: createVesselDto.tagId,
          jewelry_type: createVesselDto.jewelryType || 'necklace',
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
