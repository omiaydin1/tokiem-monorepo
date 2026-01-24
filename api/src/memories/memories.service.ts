import {
  Injectable,
  ConflictException,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { VesselsService } from '../vessels/vessels.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { Response } from 'express';

@Injectable()
export class MemoriesService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly vesselsService: VesselsService,
  ) {}

  async getMemoryByTagId(tagId: string, res: Response) {
    const vessel = await this.vesselsService.findByTagId(tagId);

    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('memories')
      .select('*')
      .eq('vessel_id', vessel.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    return res.status(HttpStatus.OK).json(data);
  }

  async create(tagId: string, createMemoryDto: CreateMemoryDto) {
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

    const memoryLimit = vessel.sender_id ? 5 : 1;

    if (count !== null && count >= memoryLimit) {
      if (vessel.sender_id) {
        throw new ConflictException('This vessel has reached its limit of 5 memories');
      } else {
        throw new ConflictException('This vessel already has a memory. Sign in to add up to 5 memories!');
      }
    }

    const { data, error } = await client
      .from('memories')
      .insert([
        {
          vessel_id: vessel.id,
          media_url: createMemoryDto.mediaUrl,
          media_type: createMemoryDto.mediaType,
          gifter_name: createMemoryDto.gifterName,
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
}
