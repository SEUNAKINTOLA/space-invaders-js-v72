/**
 * @file AudioManager.ts
 * @description Core audio system for managing and playing sound effects.
 * Provides centralized audio handling with support for multiple sounds,
 * volume control, and audio state management.
 */

// Types and interfaces
interface AudioConfig {
  volume: number;
  muted: boolean;
  maxConcurrentSounds: number;
}

interface Sound {
  id: string;
  audio: HTMLAudioElement;
  category: SoundCategory;
}

type SoundCategory = 'sfx' | 'music' | 'voice' | 'ambient';

/**
 * Manages audio playback and sound effects for the application.
 * Implements the Singleton pattern to ensure a single audio context.
 */
export class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Sound>;
  private config: AudioConfig;
  private activeAudio: Set<HTMLAudioElement>;

  private constructor() {
    this.sounds = new Map();
    this.activeAudio = new Set();
    this.config = {
      volume: 1.0,
      muted: false,
      maxConcurrentSounds: 10
    };
  }

  /**
   * Gets the singleton instance of AudioManager
   * @returns {AudioManager} The singleton instance
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Loads a sound file and adds it to the sound library
   * @param {string} id Unique identifier for the sound
   * @param {string} url URL of the audio file
   * @param {SoundCategory} category Category of the sound
   * @returns {Promise<void>}
   * @throws {Error} If sound loading fails or ID already exists
   */
  public async loadSound(
    id: string,
    url: string,
    category: SoundCategory
  ): Promise<void> {
    try {
      if (this.sounds.has(id)) {
        throw new Error(`Sound with ID '${id}' already exists`);
      }

      const audio = new Audio(url);
      await audio.load();

      this.sounds.set(id, {
        id,
        audio,
        category
      });
    } catch (error) {
      throw new Error(`Failed to load sound '${id}': ${error.message}`);
    }
  }

  /**
   * Plays a sound by its ID
   * @param {string} id The sound identifier
   * @param {boolean} loop Whether to loop the sound
   * @returns {Promise<void>}
   * @throws {Error} If sound doesn't exist or cannot be played
   */
  public async playSound(id: string, loop: boolean = false): Promise<void> {
    try {
      const sound = this.sounds.get(id);
      if (!sound) {
        throw new Error(`Sound '${id}' not found`);
      }

      if (this.activeAudio.size >= this.config.maxConcurrentSounds) {
        this.stopOldestSound();
      }

      const audioInstance = sound.audio.cloneNode() as HTMLAudioElement;
      audioInstance.volume = this.config.volume;
      audioInstance.loop = loop;
      audioInstance.muted = this.config.muted;

      this.activeAudio.add(audioInstance);
      audioInstance.addEventListener('ended', () => {
        this.activeAudio.delete(audioInstance);
      });

      await audioInstance.play();
    } catch (error) {
      throw new Error(`Failed to play sound '${id}': ${error.message}`);
    }
  }

  /**
   * Stops all currently playing sounds
   */
  public stopAllSounds(): void {
    this.activeAudio.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeAudio.clear();
  }

  /**
   * Sets the master volume
   * @param {number} volume Volume level (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.activeAudio.forEach(audio => {
      audio.volume = this.config.volume;
    });
  }

  /**
   * Toggles mute state
   * @param {boolean} muted Mute state to set
   */
  public setMuted(muted: boolean): void {
    this.config.muted = muted;
    this.activeAudio.forEach(audio => {
      audio.muted = muted;
    });
  }

  /**
   * Removes a sound from the library
   * @param {string} id Sound identifier to remove
   */
  public removeSound(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.audio.remove();
      this.sounds.delete(id);
    }
  }

  /**
   * Checks if a sound is currently playing
   * @param {string} id Sound identifier
   * @returns {boolean}
   */
  public isPlaying(id: string): boolean {
    const sound = this.sounds.get(id);
    return sound ? !sound.audio.paused : false;
  }

  private stopOldestSound(): void {
    const oldest = this.activeAudio.values().next().value;
    if (oldest) {
      oldest.pause();
      oldest.currentTime = 0;
      this.activeAudio.delete(oldest);
    }
  }

  /**
   * Cleans up resources and resets the audio manager
   */
  public dispose(): void {
    this.stopAllSounds();
    this.sounds.forEach(sound => {
      sound.audio.remove();
    });
    this.sounds.clear();
  }
}

export default AudioManager;