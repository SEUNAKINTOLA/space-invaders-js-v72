/**
 * @fileoverview Score Management System
 * Handles tracking, calculation, and persistence of scores within the application.
 * 
 * @module ScoreManager
 */

// --- Imports ---
import { EventEmitter } from 'events';

// --- Types ---
/**
 * Represents a score entry with metadata
 */
interface ScoreEntry {
  points: number;
  timestamp: Date;
  category?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Configuration options for the ScoreManager
 */
interface ScoreManagerConfig {
  initialScore?: number;
  minScore?: number;
  maxScore?: number;
  persistScores?: boolean;
}

/**
 * Score update event payload
 */
interface ScoreUpdateEvent {
  previousScore: number;
  newScore: number;
  difference: number;
  timestamp: Date;
}

// --- Constants ---
const DEFAULT_CONFIG: ScoreManagerConfig = {
  initialScore: 0,
  minScore: 0,
  maxScore: Number.MAX_SAFE_INTEGER,
  persistScores: true,
};

/**
 * Manages score tracking, calculations, and persistence
 */
export class ScoreManager extends EventEmitter {
  private currentScore: number;
  private scoreHistory: ScoreEntry[];
  private readonly config: ScoreManagerConfig;

  /**
   * Creates a new ScoreManager instance
   * @param config - Configuration options for the score manager
   */
  constructor(config: Partial<ScoreManagerConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentScore = this.config.initialScore!;
    this.scoreHistory = [];
  }

  /**
   * Adds points to the current score
   * @param points - Number of points to add
   * @param category - Optional category for the score update
   * @param metadata - Additional metadata for the score entry
   * @throws {Error} If adding points would exceed maxScore
   */
  public addPoints(points: number, category?: string, metadata?: Record<string, unknown>): void {
    if (!Number.isFinite(points)) {
      throw new Error('Points must be a finite number');
    }

    const previousScore = this.currentScore;
    const newScore = previousScore + points;

    if (newScore > this.config.maxScore!) {
      throw new Error(`Adding ${points} points would exceed maximum score of ${this.config.maxScore}`);
    }

    this.updateScore(newScore, points, category, metadata);
  }

  /**
   * Deducts points from the current score
   * @param points - Number of points to deduct
   * @param category - Optional category for the score update
   * @param metadata - Additional metadata for the score entry
   * @throws {Error} If deducting points would go below minScore
   */
  public deductPoints(points: number, category?: string, metadata?: Record<string, unknown>): void {
    if (!Number.isFinite(points)) {
      throw new Error('Points must be a finite number');
    }

    const previousScore = this.currentScore;
    const newScore = previousScore - points;

    if (newScore < this.config.minScore!) {
      throw new Error(`Deducting ${points} points would go below minimum score of ${this.config.minScore}`);
    }

    this.updateScore(newScore, -points, category, metadata);
  }

  /**
   * Gets the current score
   * @returns Current score value
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Gets the score history
   * @returns Array of score entries
   */
  public getScoreHistory(): ReadonlyArray<ScoreEntry> {
    return [...this.scoreHistory];
  }

  /**
   * Resets the score to initial value
   */
  public reset(): void {
    const previousScore = this.currentScore;
    this.currentScore = this.config.initialScore!;
    this.scoreHistory = [];

    this.emitScoreUpdate(previousScore, this.currentScore);
  }

  /**
   * Gets score statistics
   * @returns Object containing score statistics
   */
  public getStatistics() {
    const history = this.scoreHistory;
    return {
      totalEntries: history.length,
      averageChange: history.reduce((acc, entry) => acc + entry.points, 0) / history.length || 0,
      highestScore: Math.max(...history.map(entry => entry.points), this.currentScore),
      lowestScore: Math.min(...history.map(entry => entry.points), this.currentScore),
    };
  }

  /**
   * Updates the current score and maintains history
   * @private
   */
  private updateScore(
    newScore: number, 
    pointsDifference: number, 
    category?: string, 
    metadata?: Record<string, unknown>
  ): void {
    const previousScore = this.currentScore;
    this.currentScore = newScore;

    const scoreEntry: ScoreEntry = {
      points: pointsDifference,
      timestamp: new Date(),
      category,
      metadata,
    };

    this.scoreHistory.push(scoreEntry);

    if (this.config.persistScores) {
      this.persistScoreEntry(scoreEntry).catch(error => {
        console.error('Failed to persist score entry:', error);
      });
    }

    this.emitScoreUpdate(previousScore, newScore);
  }

  /**
   * Emits score update event
   * @private
   */
  private emitScoreUpdate(previousScore: number, newScore: number): void {
    const updateEvent: ScoreUpdateEvent = {
      previousScore,
      newScore,
      difference: newScore - previousScore,
      timestamp: new Date(),
    };

    this.emit('scoreUpdate', updateEvent);
  }

  /**
   * Persists score entry to storage
   * @private
   */
  private async persistScoreEntry(entry: ScoreEntry): Promise<void> {
    // Implementation would depend on storage mechanism
    // This is a placeholder for actual persistence logic
    try {
      // TODO: Implement actual persistence logic
      await Promise.resolve();
    } catch (error) {
      throw new Error(`Failed to persist score entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export default instance
export default new ScoreManager();