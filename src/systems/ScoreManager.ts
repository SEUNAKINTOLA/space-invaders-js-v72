/**
 * @file ScoreManager.ts
 * @description Manages game scoring system, including tracking, updating, and displaying scores.
 * Implements the Singleton pattern to ensure a single source of truth for score management.
 */

// Types and Interfaces
interface ScoreEvent {
    points: number;
    multiplier?: number;
    timestamp: number;
    category?: string;
}

interface ScoreState {
    currentScore: number;
    highScore: number;
    multiplier: number;
    scoreHistory: ScoreEvent[];
}

/**
 * Manages the game's scoring system.
 * Implements Singleton pattern to ensure only one score manager exists.
 */
export class ScoreManager {
    private static instance: ScoreManager;
    private scoreState: ScoreState;
    
    private readonly INITIAL_STATE: ScoreState = {
        currentScore: 0,
        highScore: 0,
        multiplier: 1,
        scoreHistory: [],
    };

    private constructor() {
        this.scoreState = this.loadState() || { ...this.INITIAL_STATE };
    }

    /**
     * Gets the singleton instance of ScoreManager
     * @returns {ScoreManager} The singleton instance
     */
    public static getInstance(): ScoreManager {
        if (!ScoreManager.instance) {
            ScoreManager.instance = new ScoreManager();
        }
        return ScoreManager.instance;
    }

    /**
     * Adds points to the current score
     * @param {number} points - The points to add
     * @param {string} [category] - Optional category for the score event
     * @throws {Error} If points is not a valid number
     */
    public addPoints(points: number, category?: string): void {
        if (!Number.isFinite(points)) {
            throw new Error('Invalid points value');
        }

        const scoreEvent: ScoreEvent = {
            points,
            multiplier: this.scoreState.multiplier,
            timestamp: Date.now(),
            category,
        };

        const adjustedPoints = points * this.scoreState.multiplier;
        this.scoreState.currentScore += adjustedPoints;
        this.scoreState.scoreHistory.push(scoreEvent);

        if (this.scoreState.currentScore > this.scoreState.highScore) {
            this.scoreState.highScore = this.scoreState.currentScore;
            this.saveState();
        }
    }

    /**
     * Sets the score multiplier
     * @param {number} multiplier - The new multiplier value
     * @throws {Error} If multiplier is not a positive number
     */
    public setMultiplier(multiplier: number): void {
        if (!Number.isFinite(multiplier) || multiplier <= 0) {
            throw new Error('Multiplier must be a positive number');
        }
        this.scoreState.multiplier = multiplier;
    }

    /**
     * Gets the current score
     * @returns {number} The current score
     */
    public getCurrentScore(): number {
        return this.scoreState.currentScore;
    }

    /**
     * Gets the high score
     * @returns {number} The high score
     */
    public getHighScore(): number {
        return this.scoreState.highScore;
    }

    /**
     * Gets the score history
     * @returns {ScoreEvent[]} Array of score events
     */
    public getScoreHistory(): ReadonlyArray<ScoreEvent> {
        return [...this.scoreState.scoreHistory];
    }

    /**
     * Resets the current score to zero
     */
    public resetScore(): void {
        this.scoreState.currentScore = 0;
        this.scoreState.multiplier = 1;
        this.scoreState.scoreHistory = [];
        this.saveState();
    }

    /**
     * Saves the current state to local storage
     * @private
     */
    private saveState(): void {
        try {
            localStorage.setItem('gameScore', JSON.stringify(this.scoreState));
        } catch (error) {
            console.error('Failed to save score state:', error);
        }
    }

    /**
     * Loads the state from local storage
     * @private
     * @returns {ScoreState | null} The loaded state or null if not found
     */
    private loadState(): ScoreState | null {
        try {
            const savedState = localStorage.getItem('gameScore');
            return savedState ? JSON.parse(savedState) : null;
        } catch (error) {
            console.error('Failed to load score state:', error);
            return null;
        }
    }
}

// Export a default instance for convenience
export default ScoreManager.getInstance();