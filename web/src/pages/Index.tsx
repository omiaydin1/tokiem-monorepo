import { useState, useEffect } from 'react';
import { Heart, Sparkles, Anchor, Gift, Loader2, ArrowRight, CircleDot, Circle, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from '@/lib/api';
import { Vessel } from '@/hooks/useVessel';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [myVessels, setMyVessels] = useState<Vessel[]>([]);
  const [vesselsLoading, setVesselsLoading] = useState(false);

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
      if (session) fetchMyVessels(session.access_token);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchMyVessels(session.access_token);
      else setMyVessels([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMyVessels = async (token: string) => {
    setVesselsLoading(true);
    try {
      const data = await apiFetch<Vessel[]>('/vessels', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setMyVessels(data);
    } catch (error) {
      console.error('Error fetching vessels:', error);
    } finally {
      setVesselsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center z-10 py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8 animate-in fade-in zoom-in duration-700">
          <Heart className="h-10 w-10 text-primary fill-primary/20" />
        </div>

        <h1 className="text-6xl md:text-7xl mb-6 font-medium tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Tokiem
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          Capture a moment, seal it in a vessel, and share a memory that lasts forever.
        </p>

        {/* Sender Section */}
        {session && (
          <div className="max-w-md mx-auto mb-16 p-8 rounded-2xl bg-secondary/40 border border-border animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 shadow-sm">
            <div className="text-left space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground px-2">Your Vessels</h3>

              {vesselsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : myVessels.length > 0 ? (
                <div className="grid gap-3">
                  {myVessels.map((v) => (
                    <Link
                      key={v.id}
                      to={`/v/${v.tag_id}`}
                      className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-border group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                          {getVesselIcon(v.jewelry_type)}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-base tracking-tight">{v.name || `Vessel ${v.tag_id}`}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em] mt-0.5">
                            {v.memory_count || 0} {v.memory_count === 1 ? 'Memory' : 'Memories'} Anchored
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ArrowRight className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-4 border-2 border-dashed border-border rounded-xl">
                  <p className="text-xs text-muted-foreground font-medium">You haven't claimed any vessels yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!session && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
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
              <p className="text-sm text-muted-foreground">Anchor it to your physical vessel</p>
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
          <p className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
            Scan a tag to get started
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
