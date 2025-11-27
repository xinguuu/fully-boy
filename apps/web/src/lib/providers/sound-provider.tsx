'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { SOUND_TYPES, SOUND_VOLUME, type SoundType } from '../constants/sounds';

interface SoundContextValue {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playSound: (type: SoundType) => void;
  stopAllSounds: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

interface AudioOscillatorConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  gain?: number;
  ramp?: boolean;
}

const SOUND_CONFIGS: Record<SoundType, AudioOscillatorConfig | AudioOscillatorConfig[]> = {
  [SOUND_TYPES.COUNTDOWN_TICK]: { frequency: 800, duration: 0.1, type: 'sine', gain: 0.3 },
  [SOUND_TYPES.COUNTDOWN_END]: { frequency: 1200, duration: 0.3, type: 'sine', gain: 0.5 },
  [SOUND_TYPES.QUESTION_START]: [
    { frequency: 523, duration: 0.15, type: 'sine' },
    { frequency: 659, duration: 0.15, type: 'sine' },
    { frequency: 784, duration: 0.2, type: 'sine' },
  ],
  [SOUND_TYPES.ANSWER_SUBMIT]: { frequency: 600, duration: 0.1, type: 'sine', gain: 0.4 },
  [SOUND_TYPES.ANSWER_CORRECT]: [
    { frequency: 523, duration: 0.1, type: 'sine' },
    { frequency: 659, duration: 0.1, type: 'sine' },
    { frequency: 784, duration: 0.15, type: 'sine' },
    { frequency: 1047, duration: 0.25, type: 'sine' },
  ],
  [SOUND_TYPES.ANSWER_WRONG]: [
    { frequency: 200, duration: 0.15, type: 'sawtooth', gain: 0.3 },
    { frequency: 150, duration: 0.25, type: 'sawtooth', gain: 0.3 },
  ],
  [SOUND_TYPES.STREAK_2]: [
    { frequency: 600, duration: 0.1, type: 'sine' },
    { frequency: 800, duration: 0.15, type: 'sine' },
  ],
  [SOUND_TYPES.STREAK_3]: [
    { frequency: 600, duration: 0.08, type: 'sine' },
    { frequency: 800, duration: 0.08, type: 'sine' },
    { frequency: 1000, duration: 0.15, type: 'sine' },
  ],
  [SOUND_TYPES.STREAK_5]: [
    { frequency: 523, duration: 0.08, type: 'sine' },
    { frequency: 659, duration: 0.08, type: 'sine' },
    { frequency: 784, duration: 0.08, type: 'sine' },
    { frequency: 1047, duration: 0.08, type: 'sine' },
    { frequency: 1318, duration: 0.2, type: 'sine' },
  ],
  [SOUND_TYPES.LEADERBOARD_REVEAL]: [
    { frequency: 400, duration: 0.15, type: 'sine' },
    { frequency: 500, duration: 0.15, type: 'sine' },
    { frequency: 600, duration: 0.15, type: 'sine' },
    { frequency: 800, duration: 0.3, type: 'sine' },
  ],
  [SOUND_TYPES.RANK_UP]: [
    { frequency: 800, duration: 0.1, type: 'sine' },
    { frequency: 1000, duration: 0.1, type: 'sine' },
    { frequency: 1200, duration: 0.15, type: 'sine' },
  ],
  [SOUND_TYPES.VICTORY]: [
    { frequency: 523, duration: 0.15, type: 'sine' },
    { frequency: 659, duration: 0.15, type: 'sine' },
    { frequency: 784, duration: 0.15, type: 'sine' },
    { frequency: 1047, duration: 0.15, type: 'sine' },
    { frequency: 784, duration: 0.1, type: 'sine' },
    { frequency: 1047, duration: 0.4, type: 'sine' },
  ],
  [SOUND_TYPES.GAME_END]: [
    { frequency: 600, duration: 0.2, type: 'sine' },
    { frequency: 500, duration: 0.2, type: 'sine' },
    { frequency: 400, duration: 0.3, type: 'sine' },
  ],
  [SOUND_TYPES.PODIUM_REVEAL]: [
    { frequency: 300, duration: 0.2, type: 'sine', ramp: true },
    { frequency: 400, duration: 0.2, type: 'sine', ramp: true },
    { frequency: 500, duration: 0.2, type: 'sine', ramp: true },
    { frequency: 700, duration: 0.4, type: 'sine' },
  ],
};

const STORAGE_KEY = 'xingu-sound-settings';

interface SoundSettings {
  isMuted: boolean;
  volume: number;
}

function loadSettings(): SoundSettings {
  if (typeof window === 'undefined') return { isMuted: false, volume: SOUND_VOLUME.MASTER };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { isMuted: false, volume: SOUND_VOLUME.MASTER };
}

function saveSettings(settings: SoundSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(SOUND_VOLUME.MASTER);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<Set<OscillatorNode>>(new Set());

  useEffect(() => {
    const settings = loadSettings();
    setIsMuted(settings.isMuted);
    setVolumeState(settings.volume);
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (config: AudioOscillatorConfig, startTime: number): number => {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.value = config.frequency;

      const effectiveGain = (config.gain ?? SOUND_VOLUME.EFFECTS) * volume;
      gainNode.gain.value = effectiveGain;

      if (config.ramp) {
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(effectiveGain, startTime + config.duration * 0.3);
        gainNode.gain.linearRampToValueAtTime(effectiveGain, startTime + config.duration * 0.7);
        gainNode.gain.linearRampToValueAtTime(0, startTime + config.duration);
      } else {
        gainNode.gain.setValueAtTime(effectiveGain, startTime);
        gainNode.gain.linearRampToValueAtTime(0, startTime + config.duration);
      }

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + config.duration);

      activeOscillatorsRef.current.add(oscillator);
      oscillator.onended = () => {
        activeOscillatorsRef.current.delete(oscillator);
      };

      return config.duration;
    },
    [getAudioContext, volume]
  );

  const playSound = useCallback(
    (type: SoundType) => {
      if (isMuted) return;

      const config = SOUND_CONFIGS[type];
      if (!config) return;

      try {
        const ctx = getAudioContext();
        let currentTime = ctx.currentTime;

        if (Array.isArray(config)) {
          config.forEach((tone) => {
            const duration = playTone(tone, currentTime);
            currentTime += duration;
          });
        } else {
          playTone(config, currentTime);
        }
      } catch {
        // Ignore audio errors (user hasn't interacted yet, etc.)
      }
    },
    [isMuted, getAudioContext, playTone]
  );

  const stopAllSounds = useCallback(() => {
    activeOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // Already stopped
      }
    });
    activeOscillatorsRef.current.clear();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      saveSettings({ isMuted: newValue, volume });
      return newValue;
    });
  }, [volume]);

  const setVolume = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      setVolumeState(clampedVolume);
      saveSettings({ isMuted, volume: clampedVolume });
    },
    [isMuted]
  );

  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAllSounds]);

  return (
    <SoundContext.Provider value={{ isMuted, volume, toggleMute, setVolume, playSound, stopAllSounds }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
