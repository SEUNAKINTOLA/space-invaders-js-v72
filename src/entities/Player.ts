import { Vector2 } from '../types/Vector2';

/**
 * Represents a player entity in the game with movement controls
 */
export class Player {
    private position: Vector2;
    private velocity: Vector2;
    private readonly speed: number;
    private readonly boundaries: { min: number; max: number };
    private touchStartX: number | null = null;
    private readonly touchThreshold: number = 20; // Minimum swipe distance to trigger movement

    /**
     * Creates a new Player instance
     * @param startPosition Initial position of the player
     * @param gameWidth Width of the game area for boundary checking
     * @param speed Movement speed of the player
     */
    constructor(startPosition: Vector2, gameWidth: number, speed: number = 5) {
        this.position = { ...startPosition };
        this.velocity = { x: 0, y: 0 };
        this.speed = speed;
        
        // Calculate boundaries based on player width (assumed 32px)
        const playerWidth = 32;
        this.boundaries = {
            min: 0,
            max: gameWidth - playerWidth
        };

        // Initialize touch event listeners
        this.initializeTouchControls();
    }

    /**
     * Initializes touch event listeners for player movement
     */
    private initializeTouchControls(): void {
        document.addEventListener('touchstart', (e: TouchEvent) => {
            this.handleTouchStart(e);
        });

        document.addEventListener('touchmove', (e: TouchEvent) => {
            this.handleTouchMove(e);
        });

        document.addEventListener('touchend', () => {
            this.handleTouchEnd();
        });
    }

    /**
     * Handles the start of a touch event
     * @param e Touch event
     */
    private handleTouchStart(e: TouchEvent): void {
        if (e.touches.length === 1) {
            this.touchStartX = e.touches[0].clientX;
        }
    }

    /**
     * Handles touch movement events
     * @param e Touch event
     */
    private handleTouchMove(e: TouchEvent): void {
        if (!this.touchStartX) return;

        const touchX = e.touches[0].clientX;
        const diffX = touchX - this.touchStartX;

        // Reset velocity first
        this.velocity.x = 0;

        // Apply movement based on touch direction and threshold
        if (Math.abs(diffX) > this.touchThreshold) {
            if (diffX < 0) {
                this.moveLeft();
            } else {
                this.moveRight();
            }
        }

        // Prevent default scrolling behavior
        e.preventDefault();
    }

    /**
     * Handles the end of a touch event
     */
    private handleTouchEnd(): void {
        this.touchStartX = null;
        this.velocity.x = 0;
    }

    /**
     * Handles keyboard input for player movement
     * @param keys Current state of keyboard keys
     */
    public handleInput(keys: Set<string>): void {
        // Reset horizontal velocity
        this.velocity.x = 0;

        // Handle left movement
        if (keys.has('ArrowLeft') || keys.has('KeyA')) {
            this.moveLeft();
        }

        // Handle right movement
        if (keys.has('ArrowRight') || keys.has('KeyD')) {
            this.moveRight();
        }
    }

    /**
     * Updates player position based on current velocity
     * @param deltaTime Time elapsed since last update
     */
    public update(deltaTime: number): void {
        // Update position with velocity
        this.position.x += this.velocity.x * deltaTime;

        // Enforce boundaries
        this.position.x = Math.max(
            this.boundaries.min,
            Math.min(this.position.x, this.boundaries.max)
        );
    }

    /**
     * Moves the player left
     */
    private moveLeft(): void {
        this.velocity.x = -this.speed;
    }

    /**
     * Moves the player right
     */
    private moveRight(): void {
        this.velocity.x = this.speed;
    }

    /**
     * Gets the current position of the player
     * @returns Current position vector
     */
    public getPosition(): Vector2 {
        return { ...this.position };
    }

    /**
     * Sets the player position directly
     * @param position New position vector
     */
    public setPosition(position: Vector2): void {
        this.position = {
            x: Math.max(
                this.boundaries.min,
                Math.min(position.x, this.boundaries.max)
            ),
            y: position.y
        };
    }

    /**
     * Cleans up touch event listeners
     */
    public dispose(): void {
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}