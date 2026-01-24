import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useVessel, useMemoryByTagId, Vessel, Memory } from '@/hooks/useVessel';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Circle, Square, RotateCcw, CheckCircle, Heart, Upload, Camera, X } from 'lucide-react';

interface SealProps {
  vessel?: Vessel | null;
  existingMemory?: Memory | null;
}

export default function Seal({ vessel: initialVessel, existingMemory: initialMemory }: SealProps) {
  const { tagId } = useParams<{ tagId: string }>();
  const [gifterName, setGifterName] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isSealed, setIsSealed] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'record' | 'upload'>('record');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: fetchedVessel, isLoading: vesselLoading } = useVessel(
    initialVessel ? undefined : tagId
  );
  const { data: fetchedMemory, isLoading: memoryLoading } = useMemoryByTagId(
    initialMemory ? undefined : tagId
  );

  const vessel = initialVessel ?? fetchedVessel;
  const existingMemory = initialMemory ?? fetchedMemory;

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
  const isReadyToSeal = !!activeBlob && !!gifterName.trim();

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
      if (!tagId || !activeBlob || !gifterName.trim()) {
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
        body: JSON.stringify({
          mediaUrl: publicUrl,
          mediaType,
          gifterName: gifterName.trim(),
          noteText: noteText.trim() || null,
        }),
      });
    },
    onSuccess: () => {
      setIsSealed(true);
      queryClient.invalidateQueries({ queryKey: ['memory', tagId] });
    },
  });

  if (vesselLoading || memoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl mb-4">Vessel Not Found</h1>
        <p className="text-muted-foreground">This tag doesn't exist in our system.</p>
      </div>
    );
  }

  if (existingMemory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle className="h-16 w-16 text-primary mb-6" />
        <h1 className="text-3xl mb-4">Already Sealed</h1>
        <p className="text-muted-foreground">This vessel already contains a memory.</p>
      </div>
    );
  }

  if (isSealed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle className="h-20 w-20 text-primary mb-8" />
        <h1 className="text-4xl mb-4">Sealed</h1>
        <p className="text-xl text-muted-foreground">Give this to someone special.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 max-w-lg mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <Heart className="h-6 w-6 text-primary fill-primary/10" />
        </div>
        <h1 className="text-4xl mb-3">Seal a Memory</h1>
        <p className="text-muted-foreground">Capture or upload a moment for someone special.</p>
      </div>

      {/* Mode selection */}
      {!isRecording && !isPreviewing && !uploadFile && (
        <div className="flex justify-center mb-8">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'record' | 'upload')} className="w-full max-w-[300px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Record
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Recording/Upload area */}
      <div className="mb-8 relative">
        {/* Decorative corner heart */}
        {!isRecording && !isPreviewing && !uploadFile && (
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-background rounded-full border border-primary/20 flex items-center justify-center shadow-sm z-20">
            <Heart className="h-4 w-4 text-primary fill-primary/20" />
          </div>
        )}

        {mode === 'record' ? (
          <>
            {!isPreviewing && (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {!isRecording && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px]">
                    <Camera className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">Ready to record</p>
                  </div>
                )}
              </div>
            )}

            {isPreviewing && activePreviewUrl && (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  ref={previewRef}
                  src={activePreviewUrl}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              </div>
            )}
          </>
        ) : (
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
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
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full h-8 w-8"
                  onClick={clearUpload}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center cursor-pointer w-full h-full hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Click to upload video or image</p>
                <p className="text-xs text-muted-foreground/60 mt-2">MP4, MOV, JPG, PNG</p>
              </div>
            )}
          </div>
        )}

        {recorderError && (
          <p className="text-destructive text-sm mt-3 text-center">{recorderError}</p>
        )}

        {/* Action controls */}
        <div className="flex justify-center gap-4 mt-6">
          {mode === 'record' && (
            <>
              {!isRecording && !isPreviewing && (
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="rounded-full px-8"
                >
                  <Circle className="h-5 w-5 mr-2 fill-current" />
                  Record
                </Button>
              )}

              {isRecording && (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="rounded-full px-8"
                >
                  <Square className="h-5 w-5 mr-2 fill-current" />
                  Stop
                </Button>
              )}

              {isPreviewing && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetRecording}
                  className="rounded-full px-8"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Re-record
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Form fields - show when we have media */}
      {(isPreviewing || uploadFile) && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Your name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={gifterName}
              onChange={(e) => setGifterName(e.target.value)}
              placeholder="Enter your name"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="note" className="text-sm font-medium">
              Add a note <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="note"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a personal message..."
              rows={3}
              className="mt-2"
            />
          </div>

          <Button
            size="lg"
            className="w-full rounded-full"
            onClick={() => sealMutation.mutate()}
            disabled={!isReadyToSeal || sealMutation.isPending}
          >
            {sealMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Sealing...
              </>
            ) : (
              'Seal Memory'
            )}
          </Button>

          {sealMutation.isError && (
            <p className="text-destructive text-sm text-center">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
