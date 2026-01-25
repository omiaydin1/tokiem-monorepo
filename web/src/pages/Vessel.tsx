import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCapsule, useMemoryByTagId } from '@/hooks/useVessel';
import Seal from './Seal';
import View from './View';
import AuthFlow from '@/components/AuthFlow';
import { Heart, Search, Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export default function Vessel() {
  const { tagId } = useParams<{ tagId: string }>();
  const [justSealed, setJustSealed] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { data: capsule, isLoading: vesselLoading, error: vesselError } = useCapsule(tagId);
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
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-background">
        <div className="max-w-2xl mx-auto w-full px-6 pt-12 pb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl bg-secondary/30" />
              <Skeleton className="h-10 w-48 bg-secondary/30" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl bg-secondary/30" />
          </div>
        </div>
        <div className="max-w-2xl mx-auto w-full px-4 py-4">
          {[1, 2].map((i) => (
            <div key={i} className="w-full bg-secondary/20 rounded-3xl overflow-hidden border border-border mb-8 animate-pulse">
              <Skeleton className="w-full aspect-video bg-secondary/30" />
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-secondary/30" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-secondary/30" />
                    <Skeleton className="h-3 w-32 bg-secondary/30" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full bg-secondary/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle case where vessel doesn't exist in DB
  if (vesselError || !capsule) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Search className="h-16 w-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-3xl mb-4 font-serif">Capsule Not Found</h1>
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
        capsule={capsule} 
        onAddMore={() => setJustSealed(true)} 
      />
    );
  }

  // Otherwise, show the Seal page (handles both no-memory and just-sealed states)
  // At this point, if there's no memory, we know there's a session (checked above)
  return (
    <Seal 
      capsule={capsule} 
      existingMemory={memory} 
      tagId={tagId}
      onSealed={() => setJustSealed(true)}
      onViewMemory={() => setJustSealed(false)}
    />
  );
}
