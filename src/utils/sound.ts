type SoundType = 'click' | 'hover' | 'success' | 'match-found' | 'analyze';

// Map sound types to file paths in the public folder
const SOUND_PATHS: Record<SoundType, string> = {
  click: '/sounds/click.mp3',
  hover: '/sounds/hover.mp3',
  success: '/sounds/success.mp3',
  'match-found': '/sounds/match-reveal.mp3',
  analyze: '/sounds/analyze-loop.mp3',
};

const audioCache: Partial<Record<SoundType, HTMLAudioElement>> = {};

/**
 * Preloads critical sounds to avoid lag on first interaction
 */
export const preloadSounds = () => {
  if (typeof window === 'undefined') return;

  (Object.keys(SOUND_PATHS) as SoundType[]).forEach((key) => {
    const audio = new Audio(SOUND_PATHS[key]);
    audio.preload = 'auto';
    audioCache[key] = audio;
  });
};

/**
 * Plays a sound effect with optional volume control
 */
export const playSound = (type: SoundType, volume = 0.5) => {
  if (typeof window === 'undefined') return;

  try {
    const audio = audioCache[type] || new Audio(SOUND_PATHS[type]);
    audio.volume = volume;
    // Clone node allows overlapping sounds (e.g. rapid clicks)
    const soundClone = audio.cloneNode() as HTMLAudioElement;
    soundClone.play().catch((e) => console.warn('Audio play blocked:', e));
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
};