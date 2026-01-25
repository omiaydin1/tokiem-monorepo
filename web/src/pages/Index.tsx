import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Sparkles, Anchor, Gift, Loader2, ArrowRight, CircleDot, Circle, Gem, Diamond } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from '@/lib/api';
import { useCapsule, Capsule, Memory } from '@/hooks/useVessel';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [myCapsules, setMyCapsules] = useState<Capsule[]>([]);
  const [capsulesLoading, setCapsulesLoading] = useState(false);

  const getCapsuleIcon = (type: string | null) => {
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
      if (session) fetchMyCapsules(session.access_token);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchMyCapsules(session.access_token);
      else setMyCapsules([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMyCapsules = async (token: string) => {
    setCapsulesLoading(true);
    try {
      const data = await apiFetch<Capsule[]>('/vessels', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setMyCapsules(data);
    } catch (error) {
      console.error('Error fetching capsules:', error);
    } finally {
      setCapsulesLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center z-10 py-6 md:py-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 animate-in fade-in zoom-in duration-700">
          <Heart className="h-8 w-8 text-primary fill-primary/20" />
        </div>

        <h1 className="text-5xl md:text-6xl mb-4 font-medium tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Memory Capsules
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-md mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          Capture a moment, seal it in a capsule, and share a memory that lasts forever.
        </p>

        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            Scan a tag to get started
          </p>
        </div>

        {/* Sender Section */}
        {session && (
          <div className="max-w-xl mx-auto mb-16 p-6 md:p-8 rounded-2xl bg-secondary/40 border border-border animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 shadow-sm">
            <div className="text-left space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground px-2">Your Capsules</h3>

              {capsulesLoading ? (
                <div className="grid gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/50 animate-pulse">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-11 h-11 rounded-xl bg-secondary/30" />
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-4 w-32 bg-secondary/30" />
                          <Skeleton className="h-3 w-20 bg-secondary/30" />
                        </div>
                      </div>
                      <Skeleton className="w-8 h-8 rounded-full bg-secondary/30" />
                    </div>
                  ))}
                </div>
              ) : myCapsules.length > 0 ? (
                <div className="grid gap-3">
                  {myCapsules.map((v) => (
                    <Link
                      key={v.id}
                      to={`/v/${v.tag_id}`}
                      className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-border group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                          {getCapsuleIcon(v.jewelry_type)}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-base tracking-tight">{v.name || `Capsule ${v.tag_id}`}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em] mt-0.5">
                            {v.memory_count || 0} {v.memory_count === 1 ? 'Memory' : 'Memories'} Sealed
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ArrowRight className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                  <div className="pt-2 text-center">
                    <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-muted-foreground/60">
                      Don't see it? Scan it!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 px-4 border border-dashed border-border rounded-2xl bg-secondary/10">
                  <Anchor className="h-6 w-6 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground/60">
                    Don't see it? Scan it!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!session && (
          <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-1">Capture</h3>
              <p className="text-sm text-muted-foreground">Record a video or audio message</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Anchor className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-1">Seal</h3>
              <p className="text-sm text-muted-foreground">Anchor it to your physical capsule</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-1">Gift</h3>
              <p className="text-sm text-muted-foreground">Give something truly one-of-a-kind</p>
            </div>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <a 
            href="https://tokiem.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            Don't have one? Order here <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
