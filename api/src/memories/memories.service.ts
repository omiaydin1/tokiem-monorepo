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
    
    // Check if memory already exists
    const { data: existingMemory } = await client
      .from('memories')
      .select('id')
      .eq('vessel_id', vessel.id)
      .maybeSingle();

    if (existingMemory) {
      throw new ConflictException('Vessel already has a memory');
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
