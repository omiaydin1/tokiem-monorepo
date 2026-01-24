import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, User, LogOut, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Navbar = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      toast({
        title: "Magic link sent!",
        description: "Check your email to sign in.",
      });
      setEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "Come back soon!",
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-50">
      <div className="max-w-5xl mx-auto h-full flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="h-5 w-5 text-primary fill-primary/10 group-hover:fill-primary/20 transition-colors" />
          <span className="text-2xl font-serif tracking-tight">Tokiem</span>
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                {session ? (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/5 text-primary">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4">
              {session ? (
                <>
                  <DropdownMenuLabel className="font-normal px-2 pb-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-medium leading-none">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm">Sign in / Create Account</h3>
                    <p className="text-xs text-muted-foreground">
                      Enter your email to receive a magic link.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-9"
                    />
                    <Button type="submit" disabled={isLoading} className="w-full h-9">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Magic Link"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">
                    <Mail className="h-3 w-3 inline mr-1 mb-0.5" /> Magic link only
                  </p>
                </form>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
