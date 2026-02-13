'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
}

export function VideoPlayer({ 
  videoUrl, 
  title, 
  onProgress, 
  onComplete,
  autoPlay = false 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgress && duration) {
        const progress = (video.currentTime / duration) * 100;
        onProgress(progress);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete) onComplete();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [duration, onProgress, onComplete]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
      setPlaybackSpeed(nextSpeed);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div 
      className="relative bg-black rounded-xl overflow-hidden shadow-2xl group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Title Overlay */}
      <div className={cn(
        "absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <h3 className="text-white text-lg font-semibold">{title}</h3>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        autoPlay={autoPlay}
        onClick={togglePlay}
      />

      {/* Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <button
            onClick={togglePlay}
            className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-all shadow-2xl"
          >
            <Play className="h-10 w-10 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-opacity duration-300",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between px-6 pb-4 pt-2">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </button>

            {/* Skip Buttons */}
            <button
              onClick={() => skip(-10)}
              className="text-white hover:text-blue-400 transition-colors"
              title="Rewind 10s"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={() => skip(10)}
              className="text-white hover:text-blue-400 transition-colors"
              title="Forward 10s"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer opacity-0 group-hover/volume:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Playback Speed */}
            <button
              onClick={changeSpeed}
              className="text-white hover:text-blue-400 transition-colors text-sm font-medium"
              title="Playback speed"
            >
              {playbackSpeed}x
            </button>

            {/* Settings (Future feature) */}
            <button
              className="text-white hover:text-blue-400 transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
