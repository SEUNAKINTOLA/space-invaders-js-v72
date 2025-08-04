/**
 * @file ScoreDisplay.ts
 * @description Score management and display component for game UI
 * @module game/ui/ScoreDisplay
 */

// ---- Types ----
interface ScoreConfig {
  initialScore: number;
  animationDuration: number;
  formatOptions?: Intl.NumberFormatOptions;
}

interface ScoreUpdateOptions {
  animate?: boolean;
  silent?: boolean;
}

// ---- Constants ----
const DEFAULT_CONFIG: ScoreConfig = {
  initialScore: 0,
  animationDuration: 500,
  formatOptions: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }
};

/**
 * ScoreDisplay class handles the management and visualization of game scores
 * with support for animations and formatting.
 */
export class ScoreDisplay {
  private currentScore: number;
  private displayElement: HTMLElement | null;
  private config: ScoreConfig;
  private formatter: Intl.NumberFormat;
  private animationFrame: number | null;

  /**
   * Creates a new ScoreDisplay instance
   * @param elementId - DOM element ID for score display
   * @param config - Configuration options for the score display
   */
  constructor(elementId: string, config: Partial<ScoreConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentScore = this.config.initialScore;
    this.displayElement = document.getElementById(elementId);
    this.formatter = new Intl.NumberFormat(
      navigator.language,
      this.config.formatOptions
    );
    this.animationFrame = null;

    if (!this.displayElement) {
      throw new Error(`Score display element with ID "${elementId}" not found`);
    }

    this.initializeDisplay();
  }

  /**
   * Updates the current score
   * @param newScore - New score value
   * @param options - Update options for animation and events
   */
  public updateScore(newScore: number, options: ScoreUpdateOptions = {}): void {
    const { animate = true, silent = false } = options;

    if (typeof newScore !== 'number' || isNaN(newScore)) {
      throw new TypeError('Score must be a valid number');
    }

    if (animate && this.displayElement) {
      this.animateScoreChange(this.currentScore, newScore);
    } else {
      this.setScore(newScore);
    }

    if (!silent) {
      this.emitScoreUpdateEvent(newScore);
    }
  }

  /**
   * Gets the current score value
   * @returns Current score
   */
  public getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Resets the score to initial value
   */
  public reset(): void {
    this.updateScore(this.config.initialScore);
  }

  /**
   * Cleans up resources used by the score display
   */
  public destroy(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.displayElement = null;
  }

  // ---- Private Methods ----

  /**
   * Initializes the score display
   */
  private initializeDisplay(): void {
    if (this.displayElement) {
      this.displayElement.textContent = this.formatScore(this.currentScore);
    }
  }

  /**
   * Sets the score and updates the display
   * @param score - Score value to set
   */
  private setScore(score: number): void {
    this.currentScore = score;
    if (this.displayElement) {
      this.displayElement.textContent = this.formatScore(score);
    }
  }

  /**
   * Formats the score value according to configuration
   * @param score - Score value to format
   * @returns Formatted score string
   */
  private formatScore(score: number): string {
    return this.formatter.format(score);
  }

  /**
   * Animates the score change
   * @param fromScore - Starting score
   * @param toScore - Target score
   */
  private animateScoreChange(fromScore: number, toScore: number): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }

    const startTime = performance.now();
    const scoreChange = toScore - fromScore;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.config.animationDuration, 1);

      // Easing function for smooth animation
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentValue = fromScore + scoreChange * eased;
      this.setScore(Math.round(currentValue));

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animationFrame = null;
        this.setScore(toScore); // Ensure final value is exact
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Emits a custom event when score is updated
   * @param newScore - Updated score value
   */
  private emitScoreUpdateEvent(newScore: number): void {
    const event = new CustomEvent('scoreUpdate', {
      detail: {
        score: newScore,
        previousScore: this.currentScore
      }
    });
    this.displayElement?.dispatchEvent(event);
  }
}

export default ScoreDisplay;