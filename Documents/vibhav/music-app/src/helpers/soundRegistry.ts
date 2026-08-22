import { Track, SoundCategory } from '../types/music';

// Sound categories mapping
export const SOUND_CATEGORIES: Record<SoundCategory, { emoji: string; label: string }> = {
  funny: { emoji: '😂', label: 'Funny' },
  gaming: { emoji: '🎮', label: 'Gaming' },
  reaction: { emoji: '😱', label: 'Reactions' },
  cute: { emoji: '❤️', label: 'Cute' },
  magical: { emoji: '✨', label: 'Magical' },
  celebration: { emoji: '🎉', label: 'Party' },
  notification: { emoji: '🔔', label: 'Notifications' },
  baby: { emoji: '🐣', label: 'Baby' },
};

// Sound file registry (these are the actual files in public/sounds)
const SOUND_FILES = [
  { filename: 'a-few-moments-later-sponge-bob-sfx-fun.mp3', title: 'A Few Moments Later', category: 'funny' as SoundCategory },
  { filename: 'aayein-meme.mp3', title: 'Aayein', category: 'funny' as SoundCategory },
  { filename: 'ab-tu-gaya-beta-ab-dekh-tu-puneet.mp3', title: 'Ab Tu Gaya Beta', category: 'funny' as SoundCategory },
  { filename: 'abhi-maza-ayagga.mp3', title: 'Abhi Maza Ayagga', category: 'funny' as SoundCategory },
  { filename: 'airhorn.mp3', title: 'Air Horn', category: 'celebration' as SoundCategory },
  { filename: 'anime-ahh.mp3', title: 'Anime Ahh', category: 'reaction' as SoundCategory },
  { filename: 'anime-wow-sound-effect.mp3', title: 'Anime Wow', category: 'reaction' as SoundCategory },
  { filename: 'applepay.mp3', title: 'Apple Pay', category: 'notification' as SoundCategory },
  { filename: 'are-baap-re-yaad-aya.mp3', title: 'Are Baap Re', category: 'funny' as SoundCategory },
  { filename: 'are_baap_re.mp3', title: 'Are Baap Re', category: 'funny' as SoundCategory },
  { filename: 'baigan.mp3', title: 'Baigan', category: 'funny' as SoundCategory },
  { filename: 'bruh.mp3', title: 'Bruh', category: 'reaction' as SoundCategory },
  { filename: 'camera-flash-sound-effect.mp3', title: 'Camera Flash', category: 'notification' as SoundCategory },
  { filename: 'celebration.mp3', title: 'Celebration', category: 'celebration' as SoundCategory },
  { filename: 'censor-beep-1.mp3', title: 'Censor Beep', category: 'funny' as SoundCategory },
  { filename: 'challo.mp3', title: 'Challo', category: 'funny' as SoundCategory },
  { filename: 'cid-acp-mc.mp3', title: 'CID ACP', category: 'funny' as SoundCategory },
  { filename: 'cid-le-mdc.mp3', title: 'CID Le MDC', category: 'funny' as SoundCategory },
  { filename: 'correct.mp3', title: 'Correct', category: 'celebration' as SoundCategory },
  { filename: 'depression-indian.mp3', title: 'Depression Indian', category: 'funny' as SoundCategory },
  { filename: 'eh-eh-ehhhh.mp3', title: 'Eh Eh Ehhhh', category: 'reaction' as SoundCategory },
  { filename: 'error_CDOxCYm.mp3', title: 'Error', category: 'notification' as SoundCategory },
  { filename: 'faaah.mp3', title: 'Faah', category: 'reaction' as SoundCategory },
  { filename: 'fahh.mp3', title: 'Fahh', category: 'reaction' as SoundCategory },
  { filename: 'gadbad.mp3', title: 'Gadbad', category: 'funny' as SoundCategory },
  { filename: 'galaxy-meme.mp3', title: 'Galaxy Meme', category: 'funny' as SoundCategory },
  { filename: 'gunshotjbudden.mp3', title: 'Gunshot', category: 'gaming' as SoundCategory },
  { filename: 'jobs_done.mp3', title: 'Jobs Done', category: 'celebration' as SoundCategory },
  { filename: 'maa-tari-oo-bhai.mp3', title: 'Ma Tari Oo Bhai', category: 'funny' as SoundCategory },
  { filename: 'mouse-click-sound.mp3', title: 'Mouse Click', category: 'notification' as SoundCategory },
  { filename: 'nahi-nahi-saluke-yaha-kuchh-to-gadbad-hai.mp3', title: 'Nahi Nahi Gadbad Hai', category: 'funny' as SoundCategory },
  { filename: 'notification_o14egLP.mp3', title: 'Notification', category: 'notification' as SoundCategory },
  { filename: 'ny-video-online-audio-converter.mp3', title: 'NY Video', category: 'funny' as SoundCategory },
  { filename: 'oof.mp3', title: 'Oof', category: 'gaming' as SoundCategory },
  { filename: 'punch-gaming-sound-effect-hd_RzlG1GE.mp3', title: 'Punch', category: 'gaming' as SoundCategory },
  { filename: 'run-vine-sound-effect.mp3', title: 'Run Vine', category: 'funny' as SoundCategory },
  { filename: 'sad_violin.mp3', title: 'Sad Violin', category: 'reaction' as SoundCategory },
  { filename: 'shocked-sound-effect.mp3', title: 'Shocked', category: 'reaction' as SoundCategory },
  { filename: 'success_chime.mp3', title: 'Success Chime', category: 'celebration' as SoundCategory },
  { filename: 'tf_nemesis.mp3', title: 'TF Nemesis', category: 'gaming' as SoundCategory },
  { filename: 'vine_boom.mp3', title: 'Vine Boom', category: 'funny' as SoundCategory },
  { filename: 'womp_womp.mp3', title: 'Womp Womp', category: 'funny' as SoundCategory },
  { filename: 'wrong-answer-sound-effect.mp3', title: 'Wrong Answer', category: 'reaction' as SoundCategory },
  { filename: 'yo-phone-is-ringing.mp3', title: 'Yo Phone Ringing', category: 'funny' as SoundCategory },
];

// Generate track ID
function generateSoundId(filename: string): string {
  return `sound-${filename.replace('.mp3', '')}`;
}

// Convert sound files to Track format
export function getLocalSounds(): Track[] {
  return SOUND_FILES.map((sound) => ({
    id: generateSoundId(sound.filename),
    title: sound.title,
    artist: 'SmartyAI',
    source: 'sound',
    src: `/sounds/${sound.filename}`,
    category: sound.category,
    playable: true,
    artwork: undefined,
    duration: undefined, // Will be loaded when played
    addedAt: Date.now(),
    playCount: 0,
  }));
}

// Get sounds by category
export function getSoundsByCategory(category: SoundCategory): Track[] {
  return getLocalSounds().filter((sound) => sound.category === category);
}

// Get all category names
export function getAllCategories(): SoundCategory[] {
  return Object.keys(SOUND_CATEGORIES) as SoundCategory[];
}
