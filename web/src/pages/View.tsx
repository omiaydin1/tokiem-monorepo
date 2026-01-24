import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemoryByTagId, Memory, Vessel } from '@/hooks/useVessel';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Heart, CheckCircle, UserPlus, Info, Share2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/api';

interface ViewProps {
  memory?: Memory | null;
  tagId?: string;
  vessel?: Vessel | null;
}

export default function View({ memory: initialMemory, tagId: propTagId, vessel: initialVessel }: ViewProps) {
  const { tagId: routeTagId } = useParams<{ tagId: string }>();
  const tagId = propTagId || routeTagId;
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [session, setSession] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: fetchedMemory, isLoading: memoryLoading } = useMemoryByTagId(
    initialMemory ? undefined : tagId
  );

  const memory = initialMemory ?? fetchedMemory;
  const vessel = initialVessel;

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!session?.access_token) return;
      return apiFetch(`/vessels/${tagId}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Vessel Claimed!",
        description: "You are now the sender of this vessel.",
      });
      queryClient.invalidateQueries({ queryKey: ['vessel', tagId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handlePlay = () => {
    setIsPlaying(true);
    if (memory?.media_type === 'video' && videoRef.current) {
      videoRef.current.play();
    } else if (memory?.media_type === 'audio' && audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setHasPlayed(true);
  };

  const handleReplay = () => {
    handlePlay();
  };

  if (memoryLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center">
        <Heart className="h-16 w-16 text-primary/30 mb-6" />
        <h1 className="text-3xl mb-4">Waiting</h1>
        <p className="text-muted-foreground">
          Waiting for someone to seal a memory.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-6 py-12 z-10">
        {/* Header Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">A memory from</p>
          <h1 className="text-4xl md:text-5xl font-serif">{memory.gifter_name}</h1>
          {memory.note_text && (
            <div className="mt-6 max-w-md mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed italic">
                "{memory.note_text}"
              </p>
            </div>
          )}
        </div>

        {/* Media Container */}
        <div className="w-full max-w-3xl relative group animate-in fade-in zoom-in duration-1000 delay-200">
          <div className="relative aspect-video bg-secondary/20 rounded-3xl overflow-hidden shadow-2xl border border-primary/5 backdrop-blur-sm">
            {!isPlaying && !hasPlayed && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/10 backdrop-blur-[2px]">
                <Button
                  size="lg"
                  onClick={handlePlay}
                  className="rounded-full w-24 h-24 p-0 shadow-xl hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
                >
                  <Play className="h-10 w-10 ml-1 fill-current" />
                </Button>
              </div>
            )}

            {isPlaying && memory.media_type === 'video' && (
              <video
                ref={videoRef}
                src={memory.media_url}
                className="w-full h-full object-contain"
                playsInline
                onEnded={handleEnded}
                controls={false}
                autoPlay
              />
            )}

            {(isPlaying || hasPlayed) && memory.media_type === 'image' && (
              <img
                src={memory.media_url}
                className="w-full h-full object-contain"
                alt="Memory"
              />
            )}

            {isPlaying && memory.media_type === 'audio' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Play className="h-12 w-12 text-primary fill-current" />
                </div>
                <audio
                  ref={audioRef}
                  src={memory.media_url}
                  onEnded={handleEnded}
                  autoPlay
                />
              </div>
            )}

            {hasPlayed && !isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/40 backdrop-blur-sm animate-in fade-in duration-300">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleReplay}
                  className="rounded-full px-8 shadow-lg group"
                >
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Replay
                </Button>
              </div>
            )}
          </div>
          
          {/* Subtle reflection effect */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-primary/10 blur-2xl rounded-full opacity-50" />
        </div>
      </div>

      {/* Persistent Footer Actions (Aligned with Nav Max-Width) */}
      <div className="w-full pb-10 pointer-events-none">
        <div className="max-w-5xl mx-auto px-6 flex justify-end items-center pointer-events-auto">
          {vessel && !vessel.sender_id && session ? (
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-full h-10 px-5 text-xs gap-2 shadow-lg border border-primary/10 bg-background/80 backdrop-blur-md hover:bg-background transition-all hover:-translate-y-0.5"
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
            >
              {claimMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
              Claim Vessel
            </Button>
          ) : vessel?.sender_id ? (
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-primary/10 shadow-sm">
              <CheckCircle className="h-3 w-3 text-primary" />
              Vessel Claimed
            </div>
          ) : !session ? (
            <div className="group relative">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-primary/10 cursor-help shadow-sm">
                <Info className="h-3 w-3" />
                Unclaimed Vessel
              </div>
              <div className="absolute bottom-full right-0 mb-3 w-56 p-3 bg-background/95 border border-primary/10 rounded-xl shadow-2xl text-[11px] leading-relaxed opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 pointer-events-none backdrop-blur-md">
                <p className="text-foreground font-medium mb-1">Unlock 5 Memories</p>
                Sign in from the top menu to claim this vessel and manage your anchored moments anytime.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
