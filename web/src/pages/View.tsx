import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMemoryByTagId, useUpdateCapsuleName, Memory, Capsule } from '@/hooks/useVessel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume2, VolumeX, Loader2, Play, Heart, CheckCircle, PlusCircle, Calendar, User, MessageCircle, Edit2, Check, X, Settings, Anchor, CircleDot, Circle, Gem } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ViewProps {
  memories?: Memory[] | null;
  tagId?: string;
  capsule?: Capsule | null;
  onAddMore?: () => void;
}

const MemoryCard = ({ memory }: { memory: Memory }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (memory.media_type !== 'video' || !videoRef.current) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6, // Play when 60% visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {
            // Autoplay might be blocked if not muted or user hasn't interacted
            console.log("Autoplay blocked");
          });
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      });
    }, options);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [memory.media_type]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const formattedDate = new Date(memory.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const displayName = memory.sender_profile?.full_name || 'Tokiem User';
  const avatarUrl = memory.sender_profile?.avatar_url;

  return (
    <div ref={containerRef} className="w-full bg-secondary/40 rounded-3xl overflow-hidden border border-border shadow-sm transition-all hover:border-primary/20 duration-500 group mb-8">
      {/* Media Section */}
      <div className="relative w-full bg-muted overflow-hidden flex items-center justify-center">
        {memory.media_type === 'video' && (
          <>
            <video
              ref={videoRef}
              src={memory.media_url}
              className="w-full h-auto max-h-[70vh]"
              playsInline
              muted={isMuted}
              loop
              autoPlay
            />
            {/* Custom Mute Toggle */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-4 right-4 rounded-full w-9 h-9 bg-black/20 hover:bg-black/40 border-none text-white backdrop-blur-sm transition-all z-30"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </>
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
              onEnded={() => setIsPlaying(false)}
              autoPlay={false}
            />
            <Button
              size="lg"
              onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  } else {
                    audioRef.current.play();
                    setIsPlaying(true);
                  }
                }
              }}
              className="mt-6 rounded-full"
            >
              {isPlaying ? 'Pause Audio' : 'Play Audio'}
            </Button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 md:p-6 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border shadow-sm">
              <AvatarImage src={avatarUrl || ''} />
              <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                {displayName?.charAt(0) || <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <span>{displayName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-[9px] uppercase tracking-wider font-bold">
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <div className="h-7 w-7 rounded-full bg-secondary/20 flex items-center justify-center border border-border/50">
            <Heart className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors group-hover:fill-primary/10" />
          </div>
        </div>

        {memory.note_text && (
          <div className="relative">
            <p className="text-sm md:text-base text-foreground/90 leading-snug font-medium">
              {memory.note_text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function View({ memories: initialMemories, tagId: propTagId, capsule: initialCapsule, onAddMore }: ViewProps) {
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
      case 'necklace': return <Anchor className="h-5 w-5 text-primary" />;
      default: return <Anchor className="h-5 w-5 text-primary" />;
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
  const capsule = initialCapsule;

  useEffect(() => {
    if (capsule?.name) {
      setEditedName(capsule.name);
    }
  }, [capsule]);

  const updateNameMutation = useUpdateCapsuleName(tagId);

  const isSender = session?.user?.id && capsule?.sender_id === session?.user?.id;

  const handleSaveName = async () => {
    if (!session?.access_token) return;
    try {
      await updateNameMutation.mutateAsync({ 
        name: editedName, 
        token: session.access_token 
      });
      setIsEditingName(false);
      toast({
        title: "Capsule name updated",
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

  if (!memories || memories.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-8 animate-pulse">
          <Heart className="h-12 w-12 text-primary/20" />
        </div>
        <h1 className="text-4xl font-serif mb-4">Awaiting a Memory</h1>
        <p className="text-muted-foreground max-w-xs text-lg">
          This capsule is ready for its first sealed moment.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col relative bg-background">
      {/* Background soft glow - removed for crisp look */}

      {/* Header Section */}
      <div className="max-w-2xl mx-auto w-full px-4 md:px-6 pt-10 md:pt-12 pb-6 md:pb-8 animate-in fade-in slide-in-from-top-4 duration-700 overflow-hidden">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="relative group flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1.5 md:gap-2 w-full">
                <Input 
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-lg md:text-2xl font-bold h-9 md:h-10 rounded-lg border-border focus:ring-1 focus:ring-primary/20 bg-white"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 hover:bg-green-50" onClick={handleSaveName} disabled={updateNameMutation.isPending}>
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 hover:bg-destructive/5" onClick={() => { setIsEditingName(false); setEditedName(capsule?.name || ''); }}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-secondary/50 border border-border flex items-center justify-center shrink-0">
                  {getVesselIcon(capsule?.jewelry_type || 'necklace')}
                </div>
                <h1 className="text-xl md:text-4xl font-bold tracking-tight text-foreground truncate leading-tight">
                  {capsule?.name || 'Tokiem Capsule'}
                </h1>
                {isSender && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="rounded-lg h-7 w-7 md:h-8 md:w-8 opacity-0 group-hover:opacity-100 transition-opacity border border-transparent hover:border-border hover:bg-white shrink-0"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {isSender && (
            <Button 
              className="rounded-xl h-9 md:h-10 px-2.5 md:px-4 text-[10px] md:text-xs gap-1.5 md:gap-2 shadow-sm border border-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95 shrink-0"
              onClick={onAddMore}
            >
              <PlusCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="font-bold hidden md:inline">Add Memory</span>
              <span className="font-bold md:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>

      {/* Feed Section */}
      <div className="max-w-xl mx-auto w-full px-4 py-8 md:py-12 z-10">
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
