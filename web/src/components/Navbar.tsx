import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, User, LogOut, Loader2, Mail, Settings } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useVessel";

export const Navbar = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const { data: profile } = useProfile(session?.access_token);

  const handleAuth = async (e: React.FormEvent, type: 'login' | 'signup') => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = type === 'login' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;

      if (type === 'signup') {
        if (data.session) {
          toast({
            title: "Account created!",
            description: "Welcome to Tokiem.",
          });
        } else {
          toast({
            title: "Check your email",
            description: "Please confirm your account to sign in.",
          });
        }
      }
      setEmail("");
      setPassword("");
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
    <nav className="fixed top-0 left-0 right-0 h-16 border-b bg-secondary/95 backdrop-blur-md z-50">
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
                  <Avatar className="h-8 w-8 border border-primary/10">
                    <AvatarImage src={profile?.avatar_url || ''} />
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
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/5 text-primary">
                          {profile?.full_name?.charAt(0) || <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold leading-none">{profile?.full_name || 'No Name Set'}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer py-2">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer py-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm">Sign in / Create Account</h3>
                    <p className="text-xs text-muted-foreground">
                      Enter your details to manage your vessels.
                    </p>
                  </div>
                  <form onSubmit={(e) => handleAuth(e, 'login')} className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-9"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-9"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isLoading} className="flex-1 h-9">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={(e) => handleAuth(e, 'signup')} 
                        disabled={isLoading} 
                        className="flex-1 h-9"
                      >
                        Sign Up
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
