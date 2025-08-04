/**
 * @file AudioManager.ts
 * @description Manages background music and audio transitions in the application
 */

import { Howl, Howler } from 'howler'; // Assuming howler.js for audio handling

/**
 * Interface for music track configuration
 */
interface MusicTrack {
  id: string;
  path: string;
  volume?: number;
  loop?: boolean;
}

/**
 * Manages background music and audio functionality
 */
export class AudioManager {
  private static instance: AudioManager;
  private currentMusic: Howl | null = null;
  private nextMusic: Howl | null = null;
  private musicTracks: Map<string, Howl> = new Map();
  private isFading: boolean = false;
  private masterVolume: number = 1.0;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Gets the singleton instance of AudioManager
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Loads a music track into memory
   * @param track Music track configuration
   * @throws Error if track loading fails
   */
  public loadMusic(track: MusicTrack): void {
    try {
      const sound = new Howl({
        src: [track.path],
        loop: track.loop ?? true,
        volume: track.volume ?? 1.0,
        preload: true,
      });

      this.musicTracks.set(track.id, sound);
    } catch (error) {
      throw new Error(`Failed to load music track: ${track.id} - ${error.message}`);
    }
  }

  /**
   * Plays a music track with optional fade transition
   * @param trackId ID of the track to play
   * @param fadeTime Fade duration in milliseconds
   * @returns Promise that resolves when the transition is complete
   */
  public async playMusic(trackId: string, fadeTime: number = 1000): Promise<void> {
    if (this.isFading) {
      return;
    }

    const track = this.musicTracks.get(trackId);
    if (!track) {
      throw new Error(`Music track not found: ${trackId}`);
    }

    try {
      if (this.currentMusic) {
        await this.crossFade(this.currentMusic, track, fadeTime);
      } else {
        track.volume(this.masterVolume);
        track.play();
      }

      this.currentMusic = track;
    } catch (error) {
      throw new Error(`Failed to play music track: ${trackId} - ${error.message}`);
    }
  }

  /**
   * Stops the current music with optional fade out
   * @param fadeTime Fade duration in milliseconds
   */
  public async stopMusic(fadeTime: number = 1000): Promise<void> {
    if (!this.currentMusic || this.isFading) {
      return;
    }

    try {
      await this.fadeOut(this.currentMusic, fadeTime);
      this.currentMusic.stop();
      this.currentMusic = null;
    } catch (error) {
      throw new Error(`Failed to stop music - ${error.message}`);
    }
  }

  /**
   * Sets the master volume for all music
   * @param volume Volume level (0.0 to 1.0)
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume(this.masterVolume);
    }
  }

  /**
   * Performs a crossfade between two tracks
   * @param fromTrack Track to fade out
   * @param toTrack Track to fade in
   * @param duration Fade duration in milliseconds
   */
  private async crossFade(fromTrack: Howl, toTrack: Howl, duration: number): Promise<void> {
    return new Promise((resolve) => {
      this.isFading = true;
      const steps = 60;
      const intervalTime = duration / steps;
      const volumeStep = this.masterVolume / steps;

      toTrack.volume(0);
      toTrack.play();

      let step = 0;
      const fadeInterval = setInterval(() => {
        step++;
        const fromVolume = Math.max(0, this.masterVolume - (volumeStep * step));
        const toVolume = Math.min(this.masterVolume, volumeStep * step);

        fromTrack.volume(fromVolume);
        toTrack.volume(toVolume);

        if (step >= steps) {
          clearInterval(fadeInterval);
          fromTrack.stop();
          this.isFading = false;
          resolve();
        }
      }, intervalTime);
    });
  }

  /**
   * Fades out a track
   * @param track Track to fade out
   * @param duration Fade duration in milliseconds
   */
  private async fadeOut(track: Howl, duration: number): Promise<void> {
    return new Promise((resolve) => {
      this.isFading = true;
      const steps = 60;
      const intervalTime = duration / steps;
      const volumeStep = this.masterVolume / steps;

      let step = 0;
      const fadeInterval = setInterval(() => {
        step++;
        const volume = Math.max(0, this.masterVolume - (volumeStep * step));
        track.volume(volume);

        if (step >= steps) {
          clearInterval(fadeInterval);
          this.isFading = false;
          resolve();
        }
      }, intervalTime);
    });
  }

  /**
   * Cleans up and releases resources
   */
  public dispose(): void {
    this.musicTracks.forEach(track => track.unload());
    this.musicTracks.clear();
    this.currentMusic = null;
    this.nextMusic = null;
  }
}