import { Track } from '../types/music';

// YouTube API configuration
// Note: You need to get a YouTube Data API key from Google Cloud Console
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Debounce helper
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Search YouTube videos
export async function searchYouTube(query: string, maxResults: number = 20): Promise<Track[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured. Set VITE_YOUTUBE_API_KEY in .env');
    return [];
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }

    const data = await response.json();

    // Get video durations
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const detailsData = await detailsResponse.json();

    const durationMap = new Map(
      detailsData.items.map((item: any) => [
        item.id,
        parseYouTubeDuration(item.contentDetails.duration),
      ])
    );

    return data.items.map((item: any) => ({
      id: `yt-${item.id.videoId}`,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      artwork: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      source: 'youtube',
      youtubeId: item.id.videoId,
      duration: durationMap.get(item.id.videoId),
      playable: true,
      addedAt: Date.now(),
      playCount: 0,
    }));
  } catch (error) {
    console.error('YouTube search failed:', error);
    return [];
  }
}

// Parse YouTube duration (PT1H2M3S -> seconds)
function parseYouTubeDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

// Format duration (seconds -> MM:SS or HH:MM:SS)
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Extract YouTube video ID from URL
export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}
