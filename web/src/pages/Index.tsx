import { Heart, Sparkles, Anchor, Gift } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8 animate-in fade-in zoom-in duration-700">
          <Heart className="h-10 w-10 text-primary fill-primary/20" />
        </div>
        
        <h1 className="text-6xl md:text-7xl mb-6 font-medium tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Tokiem
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          Capture a moment, seal it in a vessel, and share a memory that lasts forever.
        </p>

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

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <p className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
            Scan a tag to get started
          </p>
        </div>
      </div>

      <footer className="absolute bottom-8 text-center w-full px-6">
        <p className="text-xs text-muted-foreground/60 font-sans tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Tokiem &mdash; Handcrafted Memories
        </p>
      </footer>
    </div>
  );
};

export default Index;
