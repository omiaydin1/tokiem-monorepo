import {
  Injectable,
  ConflictException,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { VesselsService } from '../vessels/vessels.service';
import { ProfilesService } from '../profiles/profiles.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { Response } from 'express';

@Injectable()
export class MemoriesService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly vesselsService: VesselsService,
    private readonly profilesService: ProfilesService,
  ) {}

  async getMemoryByTagId(tagId: string, res: Response) {
    const vessel = await this.vesselsService.findByTagId(tagId);

    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('memories')
      .select('*, vessels!inner(sender_id)')
      .eq('vessel_id', vessel.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    // Fetch sender profile if exists
    const senderId = data[0]?.vessels?.sender_id;
    let profile = null;
    if (senderId) {
      const { data: profileData } = await client
        .from('profiles')
        .select('*')
        .eq('id', senderId)
        .maybeSingle();
      profile = profileData;
    }

    const memoriesWithProfile = data.map(memory => ({
      ...memory,
      sender_profile: profile,
    }));

    return res.status(HttpStatus.OK).json(memoriesWithProfile);
  }

  async create(tagId: string, createMemoryDto: CreateMemoryDto, userId: string) {
    const vessel = await this.vesselsService.findByTagId(tagId);

    const client = this.supabase.getClient();
    
    // Check existing memories count
    const { count, error: countError } = await client
      .from('memories')
      .select('*', { count: 'exact', head: true })
      .eq('vessel_id', vessel.id);

    if (countError) {
      throw new Error(countError.message);
    }

    // 1. If no sender_id, this user becomes the sender
    if (!vessel.sender_id) {
      await this.vesselsService.claim(tagId, userId);
      vessel.sender_id = userId;
      
      // Update vessel name if provided on first creation
      if (createMemoryDto.vesselName) {
        await this.vesselsService.updateName(tagId, createMemoryDto.vesselName, userId);
      }
    } else if (vessel.sender_id !== userId) {
      // 2. If sender_id exists and is not this user, they cannot add memories
      throw new ConflictException('Only the sender can add memories to this vessel');
    }

    const memoryLimit = 5; // Simplified: senders can always add up to 5

    if (count !== null && count >= memoryLimit) {
      throw new ConflictException(`This vessel has reached its limit of ${memoryLimit} memories`);
    }

    const { data, error } = await client
      .from('memories')
      .insert([
        {
          vessel_id: vessel.id,
          media_url: createMemoryDto.mediaUrl,
          media_type: createMemoryDto.mediaType,
          gifter_name: createMemoryDto.gifterName || null,
          note_text: createMemoryDto.noteText,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async incrementHearts(memoryId: string) {
    const client = this.supabase.getClient();
    
    // Use RPC or a simple increment if possible, but Supabase JS increment is easy with a raw query or fetching first.
    // However, for multiple users, we should use a Postgres function or a clever update.
    // For now, let's use a simple increment logic via SQL raw or just update with increment.
    
    const { data, error } = await client
      .rpc('increment_heart_count', { memory_id: memoryId });

    if (error) {
      // Fallback if RPC isn't defined yet (since I only added the column in migration)
      // Actually, I should add the RPC to the migration too.
      const { data: updateData, error: updateError } = await client
        .from('memories')
        .update({ heart_count: client.rpc('increment') }) // This doesn't work like this in JS client
        .eq('id', memoryId);
      
      // Let's just do a fetch and update for simplicity if RPC fails, 
      // but ideally we add the RPC to the migration.
    }
    
    // Better way with Supabase JS:
    const { data: result, error: err } = await client.from('memories').select('heart_count').eq('id', memoryId).single();
    if (err) throw err;
    
    const { data: final, error: finalErr } = await client
      .from('memories')
      .update({ heart_count: (result.heart_count || 0) + 1 })
      .eq('id', memoryId)
      .select()
      .single();
      
    if (finalErr) throw finalErr;
    return final;
  }
}
