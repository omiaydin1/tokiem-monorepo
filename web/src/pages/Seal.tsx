import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCapsule, useMemoryByTagId, Capsule, Memory } from '@/hooks/useVessel';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Square, RotateCcw, CheckCircle, Heart, Upload, Camera, X, ArrowRight, Edit3, ChevronLeft } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SealProps {
  capsule?: Capsule | null;
  existingMemory?: Memory[] | null;
  tagId?: string;
  onSealed?: () => void;
  onViewMemory?: () => void;
}

export default function Seal({ capsule: initialCapsule, existingMemory: initialMemory, tagId: propTagId, onSealed, onViewMemory }: SealProps) {
  const { tagId: routeTagId } = useParams<{ tagId: string }>();
  const tagId = propTagId || routeTagId;
  const [capsuleName, setCapsuleName] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isSealed, setIsSealed] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'record'>('upload');
  const [session, setSession] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const { data: fetchedCapsule, isLoading: vesselLoading } = useCapsule(
    initialCapsule ? undefined : tagId
  );
  const { data: fetchedMemory, isLoading: memoryLoading } = useMemoryByTagId(
    initialMemory ? undefined : tagId
  );

  const capsule = initialCapsule ?? fetchedCapsule;
  const existingMemory = initialMemory ?? fetchedMemory;

  useEffect(() => {
    if (capsule?.name) {
      setCapsuleName(capsule.name);
    }
  }, [capsule]);

  const {
    isRecording,
    isPreviewing,
    recordedBlob,
    previewUrl: recordedPreviewUrl,
    videoRef,
    previewRef,
    startRecording,
    stopRecording,
    resetRecording,
    error: recorderError,
  } = useMediaRecorder({ videoEnabled: true });

  const activePreviewUrl = mode === 'record' ? recordedPreviewUrl : uploadPreviewUrl;
  const activeBlob = mode === 'record' ? recordedBlob : uploadFile;
  const isReadyToSeal = !!activeBlob;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const url = URL.createObjectURL(file);
      setUploadPreviewUrl(url);
    }
  };

  const clearUpload = () => {
    setUploadFile(null);
    if (uploadPreviewUrl) {
      URL.revokeObjectURL(uploadPreviewUrl);
      setUploadPreviewUrl(null);
    }
  };

  const sealMutation = useMutation({
    mutationFn: async () => {
      if (!tagId || !activeBlob) {
        throw new Error('Missing required data');
      }

      let mediaType = 'video';
      let fileExt = 'webm';
      let fileType = activeBlob.type;

      if (mode === 'upload' && uploadFile) {
        if (uploadFile.type.startsWith('image/')) {
          mediaType = 'image';
          fileExt = uploadFile.name.split('.').pop() || 'jpg';
        } else {
          mediaType = 'video';
          fileExt = uploadFile.name.split('.').pop() || 'mp4';
        }
      }

      const fileName = `${tagId}-${Date.now()}.${fileExt}`;

      // 1. Get presigned URL from backend
      const { uploadUrl, publicUrl } = await apiFetch<{ uploadUrl: string; publicUrl: string }>(
        '/upload/presign',
        {
          method: 'POST',
          body: JSON.stringify({ 
            fileName, 
            contentType: fileType 
          }),
        }
      );

      // 2. Upload directly to storage using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: activeBlob,
        headers: {
          'Content-Type': fileType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload media');
      }

      // 3. Create memory record via backend
      await apiFetch(`/vessels/${tagId}/memory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          mediaUrl: publicUrl,
          mediaType,
          noteText: noteText.trim() || null,
          vesselName: capsuleName.trim() || null,
        }),
      });
    },
    onSuccess: () => {
      setIsSealed(true);
      onSealed?.();
      queryClient.invalidateQueries({ queryKey: ['capsule', tagId] });
      queryClient.invalidateQueries({ queryKey: ['memory', tagId] });
    },
  });

  if (vesselLoading || memoryLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-background">
        <div className="max-w-xl mx-auto w-full px-6 pt-12 pb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl bg-secondary/30" />
              <Skeleton className="h-10 w-48 bg-secondary/30" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl bg-secondary/30" />
          </div>
        </div>
        <div className="max-w-xl mx-auto w-full px-4 py-4">
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

  if (!capsule) {
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

  if (isSealed) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
        <CheckCircle className="h-20 w-20 text-primary mb-8" />
        <h1 className="text-4xl mb-4 font-serif">Sealed</h1>
        <p className="text-xl text-muted-foreground mb-12">This memory is now sealed to your capsule.</p>
        
        <div className="flex flex-col gap-4 w-full">
          <Button 
            className="rounded-full py-6 text-lg"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['memory', tagId] });
              onViewMemory?.();
            }}
          >
            View Memory <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-6 max-w-xl mx-auto flex flex-col">
      <div className="relative text-center mb-6">
        {existingMemory && existingMemory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 top-0 h-9 w-9 p-0 rounded-full hover:bg-secondary"
            onClick={onViewMemory}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-2xl font-bold tracking-tight mb-1">Seal a Memory</h1>
        <p className="text-sm text-muted-foreground font-medium">Capture a moment for this capsule.</p>
      </div>

      <div className="space-y-5 flex-1 bg-secondary/40 border border-border p-6 rounded-3xl shadow-sm">
        {/* Capsule Name Section - Only for first creation */}
        {existingMemory?.length === 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="capsuleName" className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground ml-0.5">
              Capsule Name
            </Label>
            <div className="relative">
              <Edit3 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
              <Input
                id="capsuleName"
                value={capsuleName}
                onChange={(e) => setCapsuleName(e.target.value)}
                placeholder="E.g. Summer 2024, Our Wedding..."
                className="pl-10 h-11 rounded-lg border-border focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Media area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground ml-0.5">
              Media
            </Label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'upload' | 'record')} className="w-auto">
              <TabsList className="h-7 p-0.5 bg-muted rounded-lg border border-border">
                <TabsTrigger value="upload" className="text-[9px] px-2 rounded-md h-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Upload</TabsTrigger>
                <TabsTrigger value="record" className="text-[9px] px-2 rounded-md h-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Record</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="relative aspect-video bg-muted/50 rounded-2xl overflow-hidden border border-border flex items-center justify-center group transition-all hover:border-primary/20">
            {mode === 'record' ? (
              <>
                {!isPreviewing && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    {!isRecording && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/10 backdrop-blur-[1px]">
                        <Button
                          size="lg"
                          onClick={startRecording}
                          className="rounded-full h-14 w-14 p-0 shadow-md bg-primary hover:bg-primary/90"
                        >
                          <Camera className="h-6 w-6" />
                        </Button>
                        <p className="text-[10px] text-foreground font-bold uppercase tracking-wider mt-3">Tap to record</p>
                      </div>
                    )}
                    {isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-destructive rounded-lg shadow-lg animate-pulse">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span className="text-[9px] text-white font-bold uppercase tracking-widest">Live</span>
                        </div>
                        <Button
                          size="lg"
                          variant="destructive"
                          onClick={stopRecording}
                          className="rounded-full h-14 w-14 p-0 shadow-lg pointer-events-auto"
                        >
                          <Square className="h-5 w-5 fill-current" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {isPreviewing && activePreviewUrl && (
                  <div className="relative w-full h-full">
                    <video
                      ref={previewRef}
                      src={activePreviewUrl}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-3 right-3 rounded-lg h-7 px-2 text-[9px] font-bold uppercase tracking-widest bg-white shadow-sm border border-border"
                      onClick={resetRecording}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Re-record
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="video/*,image/*"
                  onChange={handleFileChange}
                />
                
                {uploadFile && activePreviewUrl ? (
                  <div className="relative w-full h-full">
                    {uploadFile.type.startsWith('image/') ? (
                      <img src={activePreviewUrl} className="w-full h-full object-contain" alt="Preview" />
                    ) : (
                      <video src={activePreviewUrl} className="w-full h-full object-contain" controls playsInline />
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-3 right-3 rounded-lg h-7 w-7 shadow-sm bg-white border border-border hover:bg-destructive hover:text-white transition-colors"
                      onClick={clearUpload}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center cursor-pointer w-full h-full hover:bg-muted transition-colors duration-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-border shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold">Choose file</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Video, Image, or Audio</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Details area */}
        <div className="space-y-1.5">
          <Label htmlFor="note" className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground ml-0.5">
            Add a note
          </Label>
          <Input
            id="note"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Optional message..."
            className="h-11 rounded-lg border-border focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <Button
          size="lg"
          className="w-full rounded-xl h-12 text-sm font-bold shadow-md transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
          onClick={() => sealMutation.mutate()}
          disabled={!isReadyToSeal || sealMutation.isPending}
        >
          {sealMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sealing...
            </>
          ) : (
            <>
              <Heart className="h-4 w-4 mr-2 fill-current" />
              Seal Memory
            </>
          )}
        </Button>

        {sealMutation.isError && (
          <p className="text-destructive text-xs text-center font-medium">
            {sealMutation.error.message || 'Something went wrong. Please try again.'}
          </p>
        )}
      </div>
    </div>
  );
}
