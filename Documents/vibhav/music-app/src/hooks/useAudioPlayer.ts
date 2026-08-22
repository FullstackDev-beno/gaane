import { useEffect, useRef, useCallback } from 'react';
import { useMusicStore } from './useMusicStore';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const youtubeIframeRef = useRef<HTMLDivElement | null>(null);

  const {
    player,
    setPlayerState,
    playTrack,
    nextTrack,
    setCurrentTime,
    setDuration,
  } = useMusicStore();

  // Initialize YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Create hidden YouTube player
  const createYouTubePlayer = useCallback(async (videoId: string) => {
    // Remove existing player if any
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
    }

    // Create hidden div for YouTube player
    if (!youtubeIframeRef.current) {
      youtubeIframeRef.current = document.createElement('div');
      youtubeIframeRef.current.id = 'youtube-player';
      youtubeIframeRef.current.style.display = 'none';
      document.body.appendChild(youtubeIframeRef.current);
    }

    return new Promise<void>((resolve) => {
      if (window.YT && window.YT.Player) {
        youtubePlayerRef.current = new window.YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
          },
          events: {
            onReady: () => {
              setDuration(youtubePlayerRef.current?.getDuration?.() || 0);
              resolve();
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                if (player.repeatMode === 'one') {
                  youtubePlayerRef.current?.seekTo(0);
                  youtubePlayerRef.current?.playVideo();
                } else {
                  nextTrack();
                }
              }
            },
          },
        });
      } else {
        window.onYouTubeIframeAPIReady = () => {
          youtubePlayerRef.current = new window.YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1,
            },
            events: {
              onReady: () => {
                setDuration(youtubePlayerRef.current?.getDuration?.() || 0);
                resolve();
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  nextTrack();
                }
              },
            },
          });
        };
      }
    });
  }, [setDuration, nextTrack, player.repeatMode]);

  // Create audio element for local files
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        if (player.repeatMode === 'one') {
          audioRef.current!.currentTime = 0;
          audioRef.current!.play();
        } else {
          nextTrack();
        }
      });
    }
  }, [setCurrentTime, setDuration, nextTrack, player.repeatMode]);

  // Play track
  useEffect(() => {
    if (!player.currentTrack) return;

    const track = player.currentTrack;

    if (track.source === 'youtube' && track.youtubeId) {
      // Stop local audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Play YouTube
      createYouTubePlayer(track.youtubeId);
      setPlayerState({ isPlaying: true });
    } else if (track.source === 'local' || track.source === 'sound') {
      // Stop YouTube
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.stopVideo?.();
      }
      // Play local audio
      if (audioRef.current && track.src) {
        audioRef.current.src = track.src;
        audioRef.current.volume = player.isMuted ? 0 : player.volume;
        if (player.isPlaying) {
          audioRef.current.play().catch((err) => {
            console.error('Audio play failed:', err);
          });
        }
      }
    }
  }, [player.currentTrack?.id]);

  // Handle play/pause
  useEffect(() => {
    if (player.currentTrack?.source === 'youtube') {
      if (player.isPlaying) {
        youtubePlayerRef.current?.playVideo?.();
      } else {
        youtubePlayerRef.current?.pauseVideo?.();
      }
    } else if (audioRef.current) {
      if (player.isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error('Audio play failed:', err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [player.isPlaying, player.currentTrack?.source]);

  // Handle volume
  useEffect(() => {
    if (player.currentTrack?.source === 'youtube') {
      const volume = player.isMuted ? 0 : player.volume;
      youtubePlayerRef.current?.setVolume?.(volume * 100);
    } else if (audioRef.current) {
      audioRef.current.volume = player.isMuted ? 0 : player.volume;
    }
  }, [player.volume, player.isMuted, player.currentTrack?.source]);

  // Seek function
  const seek = useCallback((time: number) => {
    if (player.currentTrack?.source === 'youtube') {
      youtubePlayerRef.current?.seekTo?.(time);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  }, [player.currentTrack, setCurrentTime]);

  // Get current time from YouTube
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (player.currentTrack?.source === 'youtube' && player.isPlaying) {
      interval = setInterval(() => {
        const currentTime = youtubePlayerRef.current?.getCurrentTime?.() || 0;
        setCurrentTime(currentTime);
      }, 250);
    }
    return () => clearInterval(interval);
  }, [player.currentTrack?.source, player.isPlaying, setCurrentTime]);

  return {
    seek,
    audioElement: audioRef.current,
    youtubePlayer: youtubePlayerRef.current,
  };
}
