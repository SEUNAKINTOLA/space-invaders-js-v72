/**
 * @file AudioTypes.ts
 * @description Type definitions and interfaces for the audio system foundation.
 * These types provide the core structure for managing and playing sound effects.
 * @module AudioTypes
 */

// ============================================================================
// Audio Asset Types
// ============================================================================

/**
 * Represents the supported audio file formats
 */
export type AudioFileFormat = 'mp3' | 'wav' | 'ogg' | 'm4a';

/**
 * Represents the state of an audio instance
 */
export type AudioState = 'unloaded' | 'loading' | 'ready' | 'playing' | 'paused' | 'stopped' | 'error';

/**
 * Configuration options for audio playback
 */
export interface AudioPlaybackOptions {
  /** Volume level from 0 to 1 */
  volume?: number;
  /** Playback rate (1 = normal speed) */
  rate?: number;
  /** Whether the audio should loop */
  loop?: boolean;
  /** Start time in seconds */
  startTime?: number;
  /** End time in seconds (if not specified, plays to end) */
  endTime?: number;
}

/**
 * Metadata associated with an audio asset
 */
export interface AudioMetadata {
  /** Unique identifier for the audio asset */
  id: string;
  /** Display name of the audio asset */
  name: string;
  /** File format of the audio asset */
  format: AudioFileFormat;
  /** Duration in seconds */
  duration: number;
  /** File size in bytes */
  size: number;
  /** Additional custom tags */
  tags?: string[];
  /** Creation timestamp */
  created?: Date;
  /** Last modified timestamp */
  modified?: Date;
}

/**
 * Configuration for audio loading and initialization
 */
export interface AudioLoadConfig {
  /** Whether to preload the audio */
  preload?: boolean;
  /** Maximum number of simultaneous instances */
  maxInstances?: number;
  /** Default playback options */
  defaultOptions?: AudioPlaybackOptions;
  /** Timeout for loading in milliseconds */
  loadTimeout?: number;
}

/**
 * Represents an error that occurred during audio operations
 */
export interface AudioError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Original error object if available */
  originalError?: Error;
  /** Additional error context */
  context?: Record<string, unknown>;
}

/**
 * Status information for an audio instance
 */
export interface AudioStatus {
  /** Current state of the audio */
  state: AudioState;
  /** Current playback position in seconds */
  currentTime: number;
  /** Current volume level */
  volume: number;
  /** Whether audio is currently muted */
  muted: boolean;
  /** Current playback rate */
  rate: number;
  /** Whether audio is currently looping */
  loop: boolean;
}

/**
 * Events that can be emitted by the audio system
 */
export enum AudioEventType {
  LOAD_START = 'loadStart',
  LOAD_COMPLETE = 'loadComplete',
  LOAD_ERROR = 'loadError',
  PLAY_START = 'playStart',
  PLAY_COMPLETE = 'playComplete',
  PLAY_ERROR = 'playError',
  PAUSE = 'pause',
  RESUME = 'resume',
  STOP = 'stop',
  SEEK = 'seek',
  VOLUME_CHANGE = 'volumeChange',
  STATE_CHANGE = 'stateChange'
}

/**
 * Base interface for audio event data
 */
export interface AudioEventBase {
  /** Type of the audio event */
  type: AudioEventType;
  /** Timestamp when the event occurred */
  timestamp: number;
  /** ID of the audio asset */
  audioId: string;
}

/**
 * Event data for audio loading events
 */
export interface AudioLoadEvent extends AudioEventBase {
  /** Loading progress (0-1) */
  progress?: number;
  /** Error information if loading failed */
  error?: AudioError;
}

/**
 * Event data for audio playback events
 */
export interface AudioPlaybackEvent extends AudioEventBase {
  /** Current playback status */
  status: AudioStatus;
  /** Additional event-specific data */
  data?: Record<string, unknown>;
}

/**
 * Union type for all audio events
 */
export type AudioEvent = AudioLoadEvent | AudioPlaybackEvent;

/**
 * Callback type for audio event handlers
 */
export type AudioEventHandler = (event: AudioEvent) => void;

/**
 * Interface for audio cache configuration
 */
export interface AudioCacheConfig {
  /** Maximum size of the cache in bytes */
  maxSize?: number;
  /** Time to live for cached items in milliseconds */
  ttl?: number;
  /** Whether to enable cache compression */
  compression?: boolean;
}

// ============================================================================
// Validation Constants
// ============================================================================

export const AUDIO_CONSTRAINTS = {
  VOLUME_MIN: 0,
  VOLUME_MAX: 1,
  RATE_MIN: 0.25,
  RATE_MAX: 4,
  MAX_INSTANCES: 100,
  DEFAULT_LOAD_TIMEOUT: 30000, // 30 seconds
  DEFAULT_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
  DEFAULT_CACHE_TTL: 3600000, // 1 hour
} as const;

/**
 * Error codes for audio-related errors
 */
export const AUDIO_ERROR_CODES = {
  LOAD_TIMEOUT: 'LOAD_TIMEOUT',
  LOAD_FAILED: 'LOAD_FAILED',
  INVALID_FORMAT: 'INVALID_FORMAT',
  PLAYBACK_FAILED: 'PLAYBACK_FAILED',
  INVALID_STATE: 'INVALID_STATE',
  RESOURCE_BUSY: 'RESOURCE_BUSY',
} as const;