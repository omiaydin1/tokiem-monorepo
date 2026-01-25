import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMemoryByTagId, useUpdateVesselName, Memory, Vessel } from '@/hooks/useVessel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Play, Heart, CheckCircle, PlusCircle, Calendar, User, MessageCircle, Edit2, Check, X, Settings, Anchor, CircleDot, Circle, Gem } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ViewProps {
  memories?: Memory[] | null;
  tagId?: string;
  vessel?: Vessel | null;
  onAddMore?: () => void;
}

const MemoryCard = ({ memory }: { memory: Memory }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    if (memory.media_type === 'video' && videoRef.current) {
      videoRef.current.play();
    } else if (memory.media_type === 'audio' && audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setHasPlayed(true);
  };

  const formattedDate = new Date(memory.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const displayName = memory.sender_profile?.full_name || 'Tokiem User';
  const avatarUrl = memory.sender_profile?.avatar_url;

  return (
    <div className="w-full bg-secondary/40 rounded-3xl overflow-hidden border border-border shadow-sm transition-all hover:border-primary/20 duration-500 group mb-8">
      {/* Media Section */}
      <div className="relative w-full bg-muted overflow-hidden flex items-center justify-center">
        {memory.media_type === 'video' && !isPlaying && !hasPlayed && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/5 backdrop-blur-[1px]">
            <Button
              size="lg"
              onClick={handlePlay}
              className="rounded-full w-16 h-16 p-0 shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
            >
              <Play className="h-6 w-6 ml-1 fill-current" />
            </Button>
          </div>
        )}

        {memory.media_type === 'video' && (
          <video
            ref={videoRef}
            src={memory.media_url}
            className={cn(
              "w-full h-auto max-h-[70vh] transition-opacity duration-700",
              isPlaying || hasPlayed ? "opacity-100" : "opacity-40"
            )}
            playsInline
            onEnded={handleEnded}
            controls={isPlaying || hasPlayed}
            autoPlay={false}
          />
        )}

        {memory.media_type === 'image' && (
          <img
            src={memory.media_url}
            className="w-full h-auto max-h-[80vh] object-contain"
            alt="Memory"
          />
        )}

        {memory.media_type === 'audio' && (
          <div className="w-full aspect-video flex flex-col items-center justify-center bg-primary/5">
            <div className={cn(
              "w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-500",
              isPlaying && "animate-pulse scale-110"
            )}>
              <Heart className={cn("h-10 w-10 text-primary transition-all", isPlaying && "fill-primary")} />
            </div>
            <audio
              ref={audioRef}
              src={memory.media_url}
              onEnded={handleEnded}
              autoPlay={false}
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 md:p-8 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border shadow-sm">
              <AvatarImage src={avatarUrl || ''} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {displayName?.charAt(0) || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <span>{displayName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase tracking-widest font-medium">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
            <Heart className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors group-hover:fill-primary/10" />
          </div>
        </div>

        {memory.note_text && (
          <div className="relative pt-1">
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed font-normal italic">
              "{memory.note_text}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function View({ memories: initialMemories, tagId: propTagId, vessel: initialVessel, onAddMore }: ViewProps) {
  const { tagId: routeTagId } = useParams<{ tagId: string }>();
  const tagId = propTagId || routeTagId;
  const [session, setSession] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const { toast } = useToast();

  const getVesselIcon = (type: string | null) => {
    switch (type) {
      case 'ring': return <CircleDot className="h-5 w-5 text-primary" />;
      case 'bracelet': return <Circle className="h-5 w-5 text-primary" />;
      case 'necklace': return <Gem className="h-5 w-5 text-primary" />;
      default: return <Gem className="h-5 w-5 text-primary" />;
    }
  };

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

  const { data: fetchedMemories, isLoading: memoryLoading } = useMemoryByTagId(
    initialMemories ? undefined : tagId
  );

  const memories = initialMemories ?? fetchedMemories;
  const vessel = initialVessel;

  useEffect(() => {
    if (vessel?.name) {
      setEditedName(vessel.name);
    }
  }, [vessel]);

  const updateNameMutation = useUpdateVesselName(tagId);

  const isSender = session?.user?.id && vessel?.sender_id === session?.user?.id;

  const handleSaveName = async () => {
    if (!session?.access_token) return;
    try {
      await updateNameMutation.mutateAsync({ 
        name: editedName, 
        token: session.access_token 
      });
      setIsEditingName(false);
      toast({
        title: "Vessel name updated",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating name",
        description: error.message,
      });
    }
  };

  if (memoryLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!memories || memories.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-8 animate-pulse">
          <Heart className="h-12 w-12 text-primary/20" />
        </div>
        <h1 className="text-4xl font-serif mb-4">Awaiting a Memory</h1>
        <p className="text-muted-foreground max-w-xs text-lg">
          This vessel is ready for its first anchored moment.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col relative bg-background">
      {/* Background soft glow - removed for crisp look */}

      {/* Header Section */}
      <div className="max-w-2xl mx-auto w-full px-6 pt-12 pb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center justify-between gap-4">
          <div className="relative group flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2 w-full max-w-sm">
                <Input 
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-2xl font-bold h-10 rounded-lg border-border"
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={updateNameMutation.isPending}>
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => { setIsEditingName(false); setEditedName(vessel?.name || ''); }}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border flex items-center justify-center shrink-0">
                  {getVesselIcon(vessel?.jewelry_type || 'necklace')}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{vessel?.name || 'Tokiem Vessel'}</h1>
                {isSender && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="rounded-lg h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity border border-transparent hover:border-border hover:bg-white"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {isSender && (
            <Button 
              className="rounded-xl h-10 px-4 text-xs gap-2 shadow-sm border border-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95"
              onClick={onAddMore}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="font-bold">Add Memory</span>
            </Button>
          )}
        </div>
      </div>

      {/* Feed Section */}
      <div className="max-w-2xl mx-auto w-full px-4 py-12 z-10">
        <div className="flex flex-col">
          {memories.map((memory, index) => (
            <div 
              key={memory.id} 
              className="animate-in fade-in slide-in-from-bottom-8 duration-1000"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <MemoryCard memory={memory} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
