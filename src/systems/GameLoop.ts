/**
 * @file GameLoop.ts
 * @description Handles the main game loop with delta time and frame interpolation
 */

export class GameLoop {
    private lastTime: number = 0;
    private accumulator: number = 0;
    private readonly fixedTimeStep: number = 1000 / 60; // 60 FPS fixed update
    private readonly maxDeltaTime: number = 100; // Max delta time to prevent spiral of death
    
    private isRunning: boolean = false;
    private animationFrameId: number | null = null;

    // Callbacks for different update types
    private readonly updateCallbacks: Array<(deltaTime: number) => void> = [];
    private readonly fixedUpdateCallbacks: Array<(fixedDeltaTime: number) => void> = [];
    private readonly renderCallbacks: Array<(alpha: number) => void> = [];

    /**
     * Starts the game loop
     * @throws {Error} If the loop is already running
     */
    public start(): void {
        if (this.isRunning) {
            throw new Error('Game loop is already running');
        }

        this.isRunning = true;
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.tick();
    }

    /**
     * Stops the game loop
     */
    public stop(): void {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Registers a callback for variable time step updates
     * @param callback Function to call every frame with delta time
     */
    public onUpdate(callback: (deltaTime: number) => void): void {
        this.updateCallbacks.push(callback);
    }

    /**
     * Registers a callback for fixed time step updates
     * @param callback Function to call at fixed intervals
     */
    public onFixedUpdate(callback: (fixedDeltaTime: number) => void): void {
        this.fixedUpdateCallbacks.push(callback);
    }

    /**
     * Registers a callback for rendering with interpolation
     * @param callback Function to call for rendering with interpolation alpha
     */
    public onRender(callback: (alpha: number) => void): void {
        this.renderCallbacks.push(callback);
    }

    /**
     * Main game loop tick function
     * Implements frame interpolation and fixed/variable time steps
     */
    private tick = (): void => {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Clamp delta time to prevent spiral of death
        deltaTime = Math.min(deltaTime, this.maxDeltaTime);

        // Accumulate time for fixed updates
        this.accumulator += deltaTime;

        // Process variable time step updates
        this.updateCallbacks.forEach(callback => {
            try {
                callback(deltaTime);
            } catch (error) {
                console.error('Error in update callback:', error);
            }
        });

        // Process fixed time step updates
        while (this.accumulator >= this.fixedTimeStep) {
            this.fixedUpdateCallbacks.forEach(callback => {
                try {
                    callback(this.fixedTimeStep);
                } catch (error) {
                    console.error('Error in fixed update callback:', error);
                }
            });
            this.accumulator -= this.fixedTimeStep;
        }

        // Calculate interpolation alpha for smooth rendering
        const alpha = this.accumulator / this.fixedTimeStep;

        // Process render callbacks with interpolation
        this.renderCallbacks.forEach(callback => {
            try {
                callback(alpha);
            } catch (error) {
                console.error('Error in render callback:', error);
            }
        });

        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(this.tick);
    };
}

/**
 * Example usage:
 * 
 * const gameLoop = new GameLoop();
 * 
 * gameLoop.onUpdate((deltaTime) => {
 *     // Handle input and non-physics updates
 * });
 * 
 * gameLoop.onFixedUpdate((fixedDeltaTime) => {
 *     // Handle physics and fixed-rate updates
 * });
 * 
 * gameLoop.onRender((alpha) => {
 *     // Render with interpolation
 * });
 * 
 * gameLoop.start();
 */