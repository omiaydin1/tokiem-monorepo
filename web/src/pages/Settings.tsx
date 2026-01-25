import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, User, ArrowLeft, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useProfile } from '@/hooks/useVessel';

export default function Settings() {
  const [session, setSession] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate('/');
    });
  }, [navigate]);

  const { data: profile, isLoading: profileLoading } = useProfile(session?.access_token);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', session?.access_token] });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      await apiFetch('/profiles/me', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ avatarUrl: publicUrl, fullName }),
      });

      invalidateProfile();
      toast({ title: "Profile picture updated" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error uploading avatar",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!session) return;
    setUpdating(true);
    try {
      await apiFetch('/profiles/me', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ avatarUrl: null, fullName }),
      });
      setAvatarUrl('');
      invalidateProfile();
      toast({ title: "Profile picture removed" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error removing photo",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setUpdating(true);
    try {
      await apiFetch('/profiles/me', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ fullName, avatarUrl }),
      });
      invalidateProfile();
      toast({ title: "Profile updated successfully" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (profileLoading && !profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6 p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-foreground font-medium"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="bg-secondary/40 rounded-3xl border border-border p-8 md:p-10 shadow-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative group mb-6">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="relative">
              <div 
                onClick={handleAvatarClick}
                className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-300"
              >
                <Avatar className="h-28 w-28 border-2 border-muted shadow-sm overflow-hidden">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-muted text-muted-foreground text-3xl">
                    {fullName?.charAt(0) || <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
              {avatarUrl && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full shadow-md border border-border hover:bg-destructive hover:text-white transition-colors"
                  onClick={handleRemoveAvatar}
                  disabled={updating || uploading}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Personalize how you appear on memories.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground ml-0.5">
              Display Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="h-11 rounded-lg border-border focus:ring-1 focus:ring-primary/20 text-base"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl h-12 text-sm font-bold shadow-md transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
            disabled={updating || uploading}
          >
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
