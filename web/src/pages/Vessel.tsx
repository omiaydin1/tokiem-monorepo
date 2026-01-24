import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVessel, useMemoryByTagId } from '@/hooks/useVessel';
import Seal from './Seal';
import View from './View';
import { Heart, Search } from 'lucide-react';

export default function Vessel() {
  const { tagId } = useParams<{ tagId: string }>();
  const [justSealed, setJustSealed] = useState(false);
  const { data: vessel, isLoading: vesselLoading, error: vesselError } = useVessel(tagId);
  const { data: memory, isLoading: memoryLoading } = useMemoryByTagId(tagId);

  if (vesselLoading || memoryLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Heart className="h-12 w-12 text-primary relative animate-bounce" />
        </div>
        <p className="mt-8 text-muted-foreground font-serif text-lg animate-pulse">
          Finding your memory...
        </p>
      </div>
    );
  }

  // Handle case where vessel doesn't exist in DB
  if (vesselError || !vessel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Search className="h-16 w-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-3xl mb-4 font-serif">Vessel Not Found</h1>
        <p className="text-muted-foreground max-w-xs">
          This tag hasn't been registered in our system yet.
        </p>
      </div>
    );
  }

  // If there's a memory AND we're not in "just sealed" mode, show View
  if (memory && !justSealed) {
    return <View memory={memory} tagId={tagId} vessel={vessel} />;
  }

  // Otherwise, show the Seal page (handles both no-memory and just-sealed states)
  return (
    <Seal 
      vessel={vessel} 
      existingMemory={memory} 
      tagId={tagId}
      onSealed={() => setJustSealed(true)}
      onViewMemory={() => setJustSealed(false)}
    />
  );
}
