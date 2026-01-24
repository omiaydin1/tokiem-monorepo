import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly BUCKET_NAME = 'memories';

  constructor(private readonly supabase: SupabaseService) {}

  async createPresignedUrl(fileName: string) {
    const client = this.supabase.getClient();
    const filePath = `${randomUUID()}/${fileName}`;

    const { data, error } = await client.storage
      .from(this.BUCKET_NAME)
      .createSignedUploadUrl(filePath);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data: publicUrlData } = client.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      uploadUrl: data.signedUrl,
      publicUrl: publicUrlData.publicUrl,
    };
  }
}
