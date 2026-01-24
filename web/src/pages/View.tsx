import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useMemoryByTagId, Memory } from '@/hooks/useVessel';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Heart } from 'lucide-react';

interface ViewProps {
  memory?: Memory | null;
}

export default function View({ memory: initialMemory }: ViewProps) {
  const { tagId } = useParams<{ tagId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: fetchedMemory, isLoading, error } = useMemoryByTagId(
    initialMemory ? undefined : tagId
  );

  const memory = initialMemory ?? fetchedMemory;

  const handlePlay = () => {
    setIsPlaying(true);
    if (memory?.media_type === 'video' && videoRef.current) {
      videoRef.current.play();
    } else if (memory?.media_type === 'audio' && audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setHasPlayed(true);
  };

  const handleReplay = () => {
    handlePlay();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Heart className="h-16 w-16 text-primary/30 mb-6" />
        <h1 className="text-3xl mb-4">Waiting</h1>
        <p className="text-muted-foreground">
          Waiting for someone to seal a memory.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* From name */}
      <div className="py-8 px-6 text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">From</p>
        <h1 className="text-3xl">{memory.gifter_name}</h1>
      </div>

      {/* Note if exists */}
      {memory.note_text && (
        <div className="px-6 pb-8 text-center max-w-lg mx-auto">
          <p className="text-lg text-muted-foreground italic">"{memory.note_text}"</p>
        </div>
      )}

      {/* Media player */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {!isPlaying && !hasPlayed && (
          <Button
            size="lg"
            onClick={handlePlay}
            className="rounded-full w-24 h-24 p-0"
          >
            <Play className="h-10 w-10 ml-1" />
          </Button>
        )}

        {isPlaying && memory.media_type === 'video' && (
          <div className="w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={memory.media_url}
              className="w-full h-full object-contain"
              playsInline
              onEnded={handleEnded}
              controls={false}
              autoPlay
            />
          </div>
        )}

        {isPlaying && memory.media_type === 'image' && (
          <div className="w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={memory.media_url}
              className="w-full h-full object-contain"
              alt="Memory"
            />
          </div>
        )}

        {isPlaying && memory.media_type === 'audio' && (
          <div className="w-full max-w-md">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Play className="h-12 w-12 text-primary" />
            </div>
            <audio
              ref={audioRef}
              src={memory.media_url}
              onEnded={handleEnded}
              autoPlay
            />
          </div>
        )}

        {hasPlayed && !isPlaying && (
          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              onClick={handleReplay}
              className="rounded-full px-8 mb-4"
            >
              <Play className="h-5 w-5 mr-2" />
              Replay
            </Button>
            <p className="text-sm text-muted-foreground">Tap anytime to replay</p>
          </div>
        )}
      </div>
    </div>
  );
}
