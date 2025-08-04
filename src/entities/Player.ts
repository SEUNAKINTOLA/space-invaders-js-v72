import { Vector2 } from '../types/Vector2';
import { SoundManager } from '../managers/SoundManager'; // New import

/**
 * Represents a player entity in the game with movement controls
 */
export class Player {
    private position: Vector2;
    private velocity: Vector2;
    private readonly speed: number;
    private readonly boundaries: { min: number; max: number };
    private readonly soundManager: SoundManager;
    private isMoving: boolean = false;

    /**
     * Creates a new Player instance
     * @param startPosition Initial position of the player
     * @param gameWidth Width of the game area for boundary checking
     * @param speed Movement speed of the player
     * @param soundManager Sound manager instance for playing sound effects
     */
    constructor(
        startPosition: Vector2, 
        gameWidth: number, 
        speed: number = 5,
        soundManager: SoundManager
    ) {
        this.position = { ...startPosition };
        this.velocity = { x: 0, y: 0 };
        this.speed = speed;
        this.soundManager = soundManager;
        
        // Calculate boundaries based on player width (assumed 32px)
        const playerWidth = 32;
        this.boundaries = {
            min: 0,
            max: gameWidth - playerWidth
        };
    }

    /**
     * Handles keyboard input for player movement
     * @param keys Current state of keyboard keys
     */
    public handleInput(keys: Set<string>): void {
        const wasMoving = this.isMoving;
        
        // Reset horizontal velocity
        this.velocity.x = 0;
        this.isMoving = false;

        // Handle left movement
        if (keys.has('ArrowLeft') || keys.has('KeyA')) {
            this.moveLeft();
            this.isMoving = true;
        }

        // Handle right movement
        if (keys.has('ArrowRight') || keys.has('KeyD')) {
            this.moveRight();
            this.isMoving = true;
        }

        // Handle movement sound effects
        this.handleMovementSounds(wasMoving);
    }

    /**
     * Updates player position based on current velocity
     * @param deltaTime Time elapsed since last update
     */
    public update(deltaTime: number): void {
        const previousX = this.position.x;
        
        // Update position with velocity
        this.position.x += this.velocity.x * deltaTime;

        // Enforce boundaries
        const newX = Math.max(
            this.boundaries.min,
            Math.min(this.position.x, this.boundaries.max)
        );

        // Play bump sound if hit boundary
        if (newX !== this.position.x) {
            this.soundManager.playSound('playerBump');
        }

        this.position.x = newX;
    }

    /**
     * Handles playing movement-related sound effects
     * @param wasMoving Previous movement state
     */
    private handleMovementSounds(wasMoving: boolean): void {
        try {
            // Start movement sound
            if (!wasMoving && this.isMoving) {
                this.soundManager.playSound('playerMove');
            }
            // Stop movement sound
            else if (wasMoving && !this.isMoving) {
                this.soundManager.stopSound('playerMove');
            }
        } catch (error) {
            console.warn('Failed to play movement sound:', error);
            // Don't throw - sound failure shouldn't break game mechanics
        }
    }

    /**
     * Moves the player left
     */
    private moveLeft(): void {
        this.velocity.x = -this.speed;
        try {
            this.soundManager.playSound('playerTurn');
        } catch (error) {
            console.warn('Failed to play turn sound:', error);
        }
    }

    /**
     * Moves the player right
     */
    private moveRight(): void {
        this.velocity.x = this.speed;
        try {
            this.soundManager.playSound('playerTurn');
        } catch (error) {
            console.warn('Failed to play turn sound:', error);
        }
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
}