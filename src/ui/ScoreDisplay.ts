/**
 * @file ScoreDisplay.ts
 * @description A reusable component for displaying and managing game scores
 * @module ui/ScoreDisplay
 */

// =========================================================
// Types and Interfaces
// =========================================================

/**
 * Configuration options for the ScoreDisplay component
 */
interface ScoreDisplayConfig {
  initialScore?: number;
  maxScore?: number;
  animateChanges?: boolean;
  format?: 'numeric' | 'formatted';
}

/**
 * Event payload for score change events
 */
interface ScoreChangeEvent {
  previousScore: number;
  newScore: number;
  timestamp: number;
}

// =========================================================
// Constants
// =========================================================

const DEFAULT_CONFIG: ScoreDisplayConfig = {
  initialScore: 0,
  maxScore: Number.MAX_SAFE_INTEGER,
  animateChanges: true,
  format: 'numeric'
};

// =========================================================
// Main Class
// =========================================================

/**
 * ScoreDisplay class handles the display and management of game scores
 */
export class ScoreDisplay {
  private score: number;
  private readonly config: Required<ScoreDisplayConfig>;
  private element: HTMLElement | null;
  private changeListeners: ((event: ScoreChangeEvent) => void)[];

  /**
   * Creates a new ScoreDisplay instance
   * @param elementId - The ID of the HTML element to display the score
   * @param config - Configuration options for the score display
   */
  constructor(elementId: string, config: ScoreDisplayConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.score = this.config.initialScore;
    this.element = document.getElementById(elementId);
    this.changeListeners = [];

    if (!this.element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    this.initializeDisplay();
  }

  /**
   * Initialize the score display
   * @private
   */
  private initializeDisplay(): void {
    this.updateDisplay();
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for the score display
   * @private
   */
  private setupEventListeners(): void {
    // Add any necessary event listeners here
  }

  /**
   * Update the visual display of the score
   * @private
   */
  private updateDisplay(): void {
    if (!this.element) return;

    const formattedScore = this.formatScore(this.score);
    
    if (this.config.animateChanges) {
      this.animateScoreChange(formattedScore);
    } else {
      this.element.textContent = formattedScore;
    }
  }

  /**
   * Format the score based on configuration
   * @private
   * @param value - The score value to format
   * @returns Formatted score string
   */
  private formatScore(value: number): string {
    if (this.config.format === 'formatted') {
      return new Intl.NumberFormat().format(value);
    }
    return value.toString();
  }

  /**
   * Animate the score change
   * @private
   * @param newValue - The new score value to display
   */
  private animateScoreChange(newValue: string): void {
    if (!this.element) return;

    this.element.classList.add('score-changing');
    this.element.textContent = newValue;

    setTimeout(() => {
      this.element?.classList.remove('score-changing');
    }, 300);
  }

  /**
   * Update the current score
   * @param newScore - The new score value
   * @throws {Error} If the new score exceeds maxScore
   */
  public updateScore(newScore: number): void {
    if (newScore > this.config.maxScore) {
      throw new Error(`Score cannot exceed maximum value of ${this.config.maxScore}`);
    }

    const previousScore = this.score;
    this.score = newScore;
    this.updateDisplay();

    const event: ScoreChangeEvent = {
      previousScore,
      newScore,
      timestamp: Date.now()
    };

    this.notifyListeners(event);
  }

  /**
   * Add points to the current score
   * @param points - The number of points to add
   */
  public addPoints(points: number): void {
    this.updateScore(this.score + points);
  }

  /**
   * Reset the score to initial value
   */
  public reset(): void {
    this.updateScore(this.config.initialScore);
  }

  /**
   * Get the current score
   * @returns Current score value
   */
  public getCurrentScore(): number {
    return this.score;
  }

  /**
   * Add a listener for score changes
   * @param listener - Callback function for score change events
   */
  public onScoreChange(listener: (event: ScoreChangeEvent) => void): void {
    this.changeListeners.push(listener);
  }

  /**
   * Notify all listeners of a score change
   * @private
   * @param event - Score change event details
   */
  private notifyListeners(event: ScoreChangeEvent): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in score change listener:', error);
      }
    });
  }

  /**
   * Clean up the component and remove event listeners
   */
  public destroy(): void {
    this.changeListeners = [];
    this.element = null;
  }
}

// Export types for external use
export type { ScoreDisplayConfig, ScoreChangeEvent };