import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVessel, useMemoryByTagId } from '@/hooks/useVessel';
import Seal from './Seal';
import View from './View';
import AuthFlow from '@/components/AuthFlow';
import { Heart, Search, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

export default function Vessel() {
  const { tagId } = useParams<{ tagId: string }>();
  const [justSealed, setJustSealed] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { data: vessel, isLoading: vesselLoading, error: vesselError } = useVessel(tagId);
  const { data: memory, isLoading: memoryLoading } = useMemoryByTagId(tagId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (vesselLoading || memoryLoading || !authChecked) {
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

  // If there's no memory, the user MUST be authenticated to add the first one
  if (memory?.length === 0 && !justSealed && !session) {
    return (
      <div className="min-h-screen pt-12">
        <AuthFlow onSuccess={(newSession) => newSession && setSession(newSession)} tagId={tagId} />
      </div>
    );
  }

  // If there's a memory AND we're not in "just sealed" mode, show View
  if (memory && memory.length > 0 && !justSealed) {
    return (
      <View 
        memories={memory} 
        tagId={tagId} 
        vessel={vessel} 
        onAddMore={() => setJustSealed(true)} 
      />
    );
  }

  // Otherwise, show the Seal page (handles both no-memory and just-sealed states)
  // At this point, if there's no memory, we know there's a session (checked above)
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
