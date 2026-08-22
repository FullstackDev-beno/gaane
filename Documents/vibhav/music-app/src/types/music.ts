// Music source types
export type MusicSource = 'local' | 'youtube' | 'licensed' | 'sound';

// Track interface
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
  source: MusicSource;
  src?: string; // For local audio files
  youtubeId?: string; // For YouTube videos
  category?: string;
  explicit?: boolean;
  playable: boolean;
  playCount?: number;
  lastPlayed?: number;
  addedAt?: number;
}

// Playlist interface
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  artwork?: string;
  tracks: string[]; // Track IDs
  createdAt: number;
  updatedAt: number;
}

// Player state
export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
}

// Search result
export interface SearchResult {
  tracks: Track[];
  playlists: Playlist[];
}

// Analytics
export interface ListeningStats {
  totalPlays: number;
  totalDuration: number; // in seconds
  favoriteCount: number;
  playlistCount: number;
  recentlyPlayed: Track[];
  topTracks: Track[];
  streak: number; // days in a row
  lastDayPlayed: number;
}

// Sound categories
export type SoundCategory = 
  | 'funny'
  | 'gaming'
  | 'reaction'
  | 'cute'
  | 'magical'
  | 'celebration'
  | 'notification'
  | 'baby';

export interface SoundInfo {
  category: SoundCategory;
  emoji: string;
  label: string;
}
