import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track, Playlist, PlayerState, ListeningStats } from '../types/music';
import { getLocalSounds } from '../helpers/soundRegistry';

interface MusicStore {
  // Player state
  player: PlayerState;
  setPlayerState: (state: Partial<PlayerState>) => void;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;

  // Queue
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;

  // Favorites
  favorites: Track[];
  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;

  // Playlists
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => void;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;

  // Library
  library: Track[];
  loadLibrary: () => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;

  // Recently played
  recentlyPlayed: Track[];
  addToRecentlyPlayed: (track: Track) => void;

  // Stats
  stats: ListeningStats;
  updateStats: (stats: Partial<ListeningStats>) => void;
  recordPlay: (track: Track) => void;
}

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      // Initial player state
      player: {
        currentTrack: null,
        queue: [],
        queueIndex: 0,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.7,
        isMuted: false,
        isShuffle: false,
        repeatMode: 'off',
      },

      setPlayerState: (newState) =>
        set((state) => ({
          player: { ...state.player, ...newState },
        })),

      playTrack: (track) =>
        set((state) => {
          get().recordPlay(track);
          get().addToRecentlyPlayed(track);
          return {
            player: {
              ...state.player,
              currentTrack: track,
              isPlaying: true,
              currentTime: 0,
            },
          };
        }),

      togglePlay: () =>
        set((state) => ({
          player: { ...state.player, isPlaying: !state.player.isPlaying },
        })),

      nextTrack: () => {
        const { player } = get();
        if (player.queue.length === 0) return;

        let nextIndex: number;
        if (player.isShuffle) {
          nextIndex = Math.floor(Math.random() * player.queue.length);
        } else {
          nextIndex = (player.queueIndex + 1) % player.queue.length;
        }

        const nextTrack = player.queue[nextIndex];
        if (nextTrack) {
          get().playTrack(nextTrack);
          set((state) => ({
            player: { ...state.player, queueIndex: nextIndex },
          }));
        }
      },

      previousTrack: () => {
        const { player } = get();
        if (player.queue.length === 0) return;

        const prevIndex = (player.queueIndex - 1 + player.queue.length) % player.queue.length;
        const prevTrack = player.queue[prevIndex];

        if (prevTrack) {
          get().playTrack(prevTrack);
          set((state) => ({
            player: { ...state.player, queueIndex: prevIndex },
          }));
        }
      },

      setVolume: (volume) =>
        set((state) => ({
          player: { ...state.player, volume, isMuted: false },
        })),

      toggleMute: () =>
        set((state) => ({
          player: { ...state.player, isMuted: !state.player.isMuted },
        })),

      toggleShuffle: () =>
        set((state) => ({
          player: { ...state.player, isShuffle: !state.player.isShuffle },
        })),

      toggleRepeat: () =>
        set((state) => {
          const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
          const currentIndex = modes.indexOf(state.player.repeatMode);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          return {
            player: { ...state.player, repeatMode: nextMode },
          };
        }),

      setCurrentTime: (currentTime) =>
        set((state) => ({
          player: { ...state.player, currentTime },
        })),

      setDuration: (duration) =>
        set((state) => ({
          player: { ...state.player, duration },
        })),

      // Queue management
      addToQueue: (track) =>
        set((state) => ({
          player: {
            ...state.player,
            queue: [...state.player.queue, track],
          },
        })),

      removeFromQueue: (index) =>
        set((state) => ({
          player: {
            ...state.player,
            queue: state.player.queue.filter((_, i) => i !== index),
          },
        })),

      clearQueue: () =>
        set((state) => ({
          player: { ...state.player, queue: [], queueIndex: 0 },
        })),

      reorderQueue: (fromIndex, toIndex) =>
        set((state) => {
          const newQueue = [...state.player.queue];
          const [removed] = newQueue.splice(fromIndex, 1);
          newQueue.splice(toIndex, 0, removed);
          return {
            player: { ...state.player, queue: newQueue },
          };
        }),

      // Favorites
      favorites: [],

      toggleFavorite: (track) =>
        set((state) => ({
          favorites: state.favorites.some((f) => f.id === track.id)
            ? state.favorites.filter((f) => f.id !== track.id)
            : [...state.favorites, track],
        })),

      isFavorite: (trackId) => get().favorites.some((f) => f.id === trackId),

      // Playlists
      playlists: [],

      createPlaylist: (name, description) =>
        set((state) => ({
          playlists: [
            ...state.playlists,
            {
              id: `playlist-${Date.now()}`,
              name,
              description,
              tracks: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      deletePlaylist: (playlistId) =>
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== playlistId),
        })),

      renamePlaylist: (playlistId, newName) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId ? { ...p, name: newName, updatedAt: Date.now() } : p
          ),
        })),

      addToPlaylist: (playlistId, trackId) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, tracks: [...new Set([...p.tracks, trackId])], updatedAt: Date.now() }
              : p
          ),
        })),

      removeFromPlaylist: (playlistId, trackId) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, tracks: p.tracks.filter((t) => t !== trackId), updatedAt: Date.now() }
              : p
          ),
        })),

      // Library
      library: [],

      loadLibrary: () => {
        const localSounds = getLocalSounds();
        set({ library: localSounds });
      },

      addTrack: (track) =>
        set((state) => ({
          library: state.library.some((t) => t.id === track.id)
            ? state.library
            : [...state.library, track],
        })),

      removeTrack: (trackId) =>
        set((state) => ({
          library: state.library.filter((t) => t.id !== trackId),
        })),

      // Recently played
      recentlyPlayed: [],

      addToRecentlyPlayed: (track) =>
        set((state) => {
          const filtered = state.recentlyPlayed.filter((t) => t.id !== track.id);
          return {
            recentlyPlayed: [track, ...filtered].slice(0, 20), // Keep last 20
          };
        }),

      // Stats
      stats: {
        totalPlays: 0,
        totalDuration: 0,
        favoriteCount: 0,
        playlistCount: 0,
        recentlyPlayed: [],
        topTracks: [],
        streak: 0,
        lastDayPlayed: 0,
      },

      updateStats: (newStats) =>
        set((state) => ({
          stats: { ...state.stats, ...newStats },
        })),

      recordPlay: (track) =>
        set((state) => {
          const now = Date.now();
          const today = new Date().setHours(0, 0, 0, 0);

          let streak = state.stats.streak;
          const lastDay = state.stats.lastDayPlayed;

          if (lastDay === 0) {
            streak = 1;
          } else if (today - lastDay === 86400000) {
            streak += 1;
          } else if (today - lastDay > 86400000) {
            streak = 1;
          }

          return {
            stats: {
              ...state.stats,
              totalPlays: state.stats.totalPlays + 1,
              lastDayPlayed: today,
              streak,
              favoriteCount: state.favorites.length,
              playlistCount: state.playlists.length,
              recentlyPlayed: state.recentlyPlayed,
            },
          };
        }),
    }),
    {
      name: 'music-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        playlists: state.playlists,
        recentlyPlayed: state.recentlyPlayed,
        stats: state.stats,
        player: {
          volume: state.player.volume,
          isShuffle: state.player.isShuffle,
          repeatMode: state.player.repeatMode,
        },
      }),
    }
  )
);
