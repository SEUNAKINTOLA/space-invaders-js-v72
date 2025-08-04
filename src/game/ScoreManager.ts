/**
 * @file ScoreManager.ts
 * @description Manages game score tracking, persistence, and display functionality.
 * Handles score calculations, high scores, and score-related events.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Represents a score entry with player information and timestamp
 */
interface ScoreEntry {
  points: number;
  playerName?: string;
  timestamp: Date;
  multiplier: number;
}

/**
 * Configuration options for the ScoreManager
 */
interface ScoreManagerConfig {
  initialScore?: number;
  maxMultiplier?: number;
  persistScores?: boolean;
  maxHighScores?: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: ScoreManagerConfig = {
  initialScore: 0,
  maxMultiplier: 10,
  persistScores: true,
  maxHighScores: 10,
};

const STORAGE_KEY = 'gameHighScores';

// ============================================================================
// Score Manager Class
// ============================================================================

export class ScoreManager {
  private currentScore: number;
  private highScores: ScoreEntry[];
  private multiplier: number;
  private config: ScoreManagerConfig;
  private scoreChangeCallbacks: ((score: number) => void)[];

  /**
   * Creates a new ScoreManager instance
   * @param config - Configuration options for the score manager
   */
  constructor(config: ScoreManagerConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentScore = this.config.initialScore!;
    this.multiplier = 1;
    this.highScores = [];
    this.scoreChangeCallbacks = [];
    
    if (this.config.persistScores) {
      this.loadHighScores();
    }
  }

  /**
   * Adds points to the current score
   * @param points - Number of points to add
   * @throws {Error} If points is negative
   */
  public addPoints(points: number): void {
    if (points < 0) {
      throw new Error('Points cannot be negative');
    }

    const adjustedPoints = points * this.multiplier;
    this.currentScore += adjustedPoints;
    this.notifyScoreChange();
  }

  /**
   * Sets the score multiplier
   * @param multiplier - New multiplier value
   * @throws {Error} If multiplier is invalid
   */
  public setMultiplier(multiplier: number): void {
    if (multiplier < 1 || multiplier > this.config.maxMultiplier!) {
      throw new Error(`Multiplier must be between 1 and ${this.config.maxMultiplier}`);
    }

    this.multiplier = multiplier;
  }

  /**
   * Gets the current score
   * @returns Current score value
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Resets the score to initial value
   */
  public resetScore(): void {
    this.currentScore = this.config.initialScore!;
    this.multiplier = 1;
    this.notifyScoreChange();
  }

  /**
   * Registers a callback for score changes
   * @param callback - Function to call when score changes
   */
  public onScoreChange(callback: (score: number) => void): void {
    this.scoreChangeCallbacks.push(callback);
  }

  /**
   * Saves current score as a high score entry
   * @param playerName - Optional player name for the score entry
   */
  public saveHighScore(playerName?: string): void {
    const newEntry: ScoreEntry = {
      points: this.currentScore,
      playerName,
      timestamp: new Date(),
      multiplier: this.multiplier,
    };

    this.highScores.push(newEntry);
    this.highScores.sort((a, b) => b.points - a.points);

    if (this.highScores.length > this.config.maxHighScores!) {
      this.highScores = this.highScores.slice(0, this.config.maxHighScores);
    }

    if (this.config.persistScores) {
      this.persistHighScores();
    }
  }

  /**
   * Gets the current high scores
   * @returns Array of high score entries
   */
  public getHighScores(): ReadonlyArray<ScoreEntry> {
    return [...this.highScores];
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Notifies all registered callbacks of score changes
   */
  private notifyScoreChange(): void {
    this.scoreChangeCallbacks.forEach(callback => {
      try {
        callback(this.currentScore);
      } catch (error) {
        console.error('Error in score change callback:', error);
      }
    });
  }

  /**
   * Loads high scores from local storage
   */
  private loadHighScores(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.highScores = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch (error) {
      console.error('Error loading high scores:', error);
      this.highScores = [];
    }
  }

  /**
   * Persists high scores to local storage
   */
  private persistHighScores(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.highScores));
    } catch (error) {
      console.error('Error persisting high scores:', error);
    }
  }
}

// ============================================================================
// Export default instance
// ============================================================================

export default new ScoreManager();