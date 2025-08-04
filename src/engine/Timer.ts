/**
 * @file Timer.ts
 * @description Game loop timing utility that provides fixed timestep updates and timing management.
 * Implements a deterministic game loop with accumulator pattern for physics consistency.
 */

/**
 * Configuration constants for the Timer
 */
const TIME_CONSTANTS = {
    /** Default fixed timestep in milliseconds */
    DEFAULT_FIXED_TIMESTEP: 1000 / 60, // 60 FPS
    /** Maximum delta time to prevent spiral of death */
    MAX_DELTA_TIME: 1000 / 30, // 30 FPS
    /** Minimum delta time to ensure smooth updates */
    MIN_DELTA_TIME: 1000 / 120 // 120 FPS
} as const;

/**
 * Interface for Timer configuration options
 */
interface TimerConfig {
    fixedTimestep?: number;
    maxDeltaTime?: number;
    startPaused?: boolean;
}

/**
 * Timer class for managing game loop timing and updates
 */
export class Timer {
    private lastTime: number;
    private accumulator: number;
    private fixedTimestep: number;
    private maxDeltaTime: number;
    private isPaused: boolean;
    private rafId: number | null;

    /**
     * Creates a new Timer instance
     * @param config Optional configuration parameters
     */
    constructor(config: TimerConfig = {}) {
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimestep = config.fixedTimestep ?? TIME_CONSTANTS.DEFAULT_FIXED_TIMESTEP;
        this.maxDeltaTime = config.maxDeltaTime ?? TIME_CONSTANTS.MAX_DELTA_TIME;
        this.isPaused = config.startPaused ?? false;
        this.rafId = null;
    }

    /**
     * Starts the timer
     * @throws Error if timer is already running
     */
    public start(): void {
        if (this.rafId !== null) {
            throw new Error('Timer is already running');
        }

        this.lastTime = performance.now();
        this.isPaused = false;
        this.tick();
    }

    /**
     * Stops the timer
     */
    public stop(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.isPaused = true;
        this.accumulator = 0;
    }

    /**
     * Pauses the timer
     */
    public pause(): void {
        this.isPaused = true;
    }

    /**
     * Resumes the timer
     */
    public resume(): void {
        if (this.isPaused) {
            this.isPaused = false;
            this.lastTime = performance.now();
        }
    }

    /**
     * Updates the timer state and executes update callbacks
     * @param fixedUpdateFn Callback for fixed timestep updates
     * @param renderFn Callback for render updates
     */
    private tick = (): void => {
        this.rafId = requestAnimationFrame(this.tick);

        if (this.isPaused) {
            return;
        }

        const currentTime = performance.now();
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Clamp delta time to prevent spiral of death
        deltaTime = Math.min(deltaTime, this.maxDeltaTime);
        deltaTime = Math.max(deltaTime, TIME_CONSTANTS.MIN_DELTA_TIME);

        this.accumulator += deltaTime;

        // Emit accumulated fixed updates
        while (this.accumulator >= this.fixedTimestep) {
            this.emitFixedUpdate(this.fixedTimestep);
            this.accumulator -= this.fixedTimestep;
        }

        // Emit render update with interpolation factor
        const alpha = this.accumulator / this.fixedTimestep;
        this.emitRenderUpdate(alpha);
    };

    /**
     * Event handler for fixed timestep updates
     * @param deltaTime Fixed timestep duration
     */
    private emitFixedUpdate(deltaTime: number): void {
        // Implement event emission or callback execution for fixed updates
        // This would be connected to the game's update system
    }

    /**
     * Event handler for render updates
     * @param interpolationFactor Alpha value for interpolation (0-1)
     */
    private emitRenderUpdate(interpolationFactor: number): void {
        // Implement event emission or callback execution for render updates
        // This would be connected to the game's render system
    }

    /**
     * Gets the current fixed timestep value
     * @returns The fixed timestep in milliseconds
     */
    public getFixedTimestep(): number {
        return this.fixedTimestep;
    }

    /**
     * Sets a new fixed timestep value
     * @param timestep New fixed timestep in milliseconds
     * @throws Error if timestep is invalid
     */
    public setFixedTimestep(timestep: number): void {
        if (timestep <= 0) {
            throw new Error('Fixed timestep must be greater than 0');
        }
        this.fixedTimestep = timestep;
    }

    /**
     * Checks if the timer is currently running
     * @returns True if the timer is running
     */
    public isRunning(): boolean {
        return this.rafId !== null && !this.isPaused;
    }
}