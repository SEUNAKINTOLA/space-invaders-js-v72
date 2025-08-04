/**
 * @file GameLoop.ts
 * @description Implements a fixed timestep game loop with frame interpolation.
 * This game loop ensures consistent update timing while allowing for smooth rendering.
 * 
 * Features:
 * - Fixed timestep updates for consistent game logic
 * - Frame interpolation for smooth rendering
 * - FPS monitoring and statistics
 * - Configurable update rate
 * - Panic mode for handling slow performance
 */

// Constants for game loop configuration
const DEFAULT_FPS = 60;
const DEFAULT_FRAME_TIME = 1000 / DEFAULT_FPS;
const MAX_UPDATES_PER_FRAME = 10;

/**
 * Statistics interface for monitoring game loop performance
 */
interface GameLoopStats {
    fps: number;
    frameTime: number;
    updates: number;
    renders: number;
}

/**
 * Callback functions interface for game loop events
 */
interface GameLoopCallbacks {
    update: (deltaTime: number) => void;
    render: (interpolation: number) => void;
    onPanic?: () => void;
    onStats?: (stats: GameLoopStats) => void;
}

/**
 * Configuration options for the game loop
 */
interface GameLoopOptions {
    fps?: number;
    enableStats?: boolean;
    statsSampleSize?: number;
}

/**
 * GameLoop class implementing a fixed timestep game loop architecture
 */
export class GameLoop {
    private fps: number;
    private frameTime: number;
    private running: boolean;
    private rafId: number;
    private lastTime: number;
    private accumulator: number;
    private statsEnabled: boolean;
    private statsSampleSize: number;
    private frameTimeHistory: number[];
    private stats: GameLoopStats;
    private callbacks: GameLoopCallbacks;

    /**
     * Creates a new GameLoop instance
     * @param callbacks - Object containing update and render callback functions
     * @param options - Configuration options for the game loop
     */
    constructor(callbacks: GameLoopCallbacks, options: GameLoopOptions = {}) {
        this.validateCallbacks(callbacks);
        
        this.fps = options.fps || DEFAULT_FPS;
        this.frameTime = 1000 / this.fps;
        this.running = false;
        this.rafId = 0;
        this.lastTime = 0;
        this.accumulator = 0;
        
        this.statsEnabled = options.enableStats || false;
        this.statsSampleSize = options.statsSampleSize || 60;
        this.frameTimeHistory = [];
        this.stats = {
            fps: 0,
            frameTime: 0,
            updates: 0,
            renders: 0
        };
        
        this.callbacks = callbacks;
    }

    /**
     * Starts the game loop
     */
    public start(): void {
        if (this.running) {
            return;
        }

        this.running = true;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    /**
     * Stops the game loop
     */
    public stop(): void {
        if (!this.running) {
            return;
        }

        this.running = false;
        cancelAnimationFrame(this.rafId);
    }

    /**
     * Main game loop function
     * @param currentTime - Current timestamp
     */
    private loop(currentTime: number): void {
        if (!this.running) {
            return;
        }

        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (this.statsEnabled) {
            this.updateStats(deltaTime);
        }

        // Add the delta time to the accumulator
        this.accumulator += deltaTime;

        // Update game logic at fixed intervals
        let updates = 0;
        while (this.accumulator >= this.frameTime && updates < MAX_UPDATES_PER_FRAME) {
            try {
                this.callbacks.update(this.frameTime);
                this.accumulator -= this.frameTime;
                updates++;
            } catch (error) {
                console.error('Error in update callback:', error);
                this.stop();
                return;
            }
        }

        // Handle case where game is running too slowly
        if (updates >= MAX_UPDATES_PER_FRAME) {
            this.handlePanic();
            this.accumulator = 0;
        }

        // Calculate interpolation for smooth rendering
        const interpolation = this.accumulator / this.frameTime;

        // Render the frame
        try {
            this.callbacks.render(interpolation);
        } catch (error) {
            console.error('Error in render callback:', error);
            this.stop();
            return;
        }

        // Schedule next frame
        this.rafId = requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    /**
     * Updates performance statistics
     * @param deltaTime - Time since last frame
     */
    private updateStats(deltaTime: number): void {
        this.frameTimeHistory.push(deltaTime);
        if (this.frameTimeHistory.length > this.statsSampleSize) {
            this.frameTimeHistory.shift();
        }

        const averageFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / 
                               this.frameTimeHistory.length;

        this.stats = {
            fps: 1000 / averageFrameTime,
            frameTime: averageFrameTime,
            updates: this.stats.updates + 1,
            renders: this.stats.renders + 1
        };

        if (this.callbacks.onStats) {
            this.callbacks.onStats(this.stats);
        }
    }

    /**
     * Handles cases where the game loop is running too slowly
     */
    private handlePanic(): void {
        if (this.callbacks.onPanic) {
            this.callbacks.onPanic();
        }
        console.warn('Game loop running slowly, skipping frames');
    }

    /**
     * Validates the required callback functions
     * @param callbacks - Object containing callback functions
     */
    private validateCallbacks(callbacks: GameLoopCallbacks): void {
        if (typeof callbacks.update !== 'function') {
            throw new Error('Update callback must be a function');
        }
        if (typeof callbacks.render !== 'function') {
            throw new Error('Render callback must be a function');
        }
    }

    /**
     * Gets the current game loop statistics
     * @returns Current statistics
     */
    public getStats(): GameLoopStats {
        return { ...this.stats };
    }

    /**
     * Gets the current FPS setting
     * @returns Current FPS
     */
    public getFPS(): number {
        return this.fps;
    }
}