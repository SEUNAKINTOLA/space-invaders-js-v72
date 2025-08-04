/**
 * @file InputManager.ts
 * @description Manages game input with buffering for smooth and responsive controls
 */

import { Vector2 } from '../types/Vector2';

interface InputAction {
    key: string;
    timestamp: number;
    processed: boolean;
}

export class InputManager {
    private static instance: InputManager;
    
    private readonly inputBuffer: InputAction[] = [];
    private readonly bufferTimeWindow: number = 150; // ms
    private readonly maxBufferSize: number = 10;
    
    private currentKeys: Set<string> = new Set();
    private mousePosition: Vector2 = { x: 0, y: 0 };
    private lastUpdateTime: number = 0;

    private constructor() {
        this.initializeEventListeners();
    }

    /**
     * Gets the singleton instance of InputManager
     */
    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    /**
     * Initializes event listeners for keyboard and mouse input
     */
    private initializeEventListeners(): void {
        try {
            window.addEventListener('keydown', this.handleKeyDown.bind(this));
            window.addEventListener('keyup', this.handleKeyUp.bind(this));
            window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        } catch (error) {
            console.error('Failed to initialize input event listeners:', error);
        }
    }

    /**
     * Handles keydown events and adds them to the input buffer
     */
    private handleKeyDown(event: KeyboardEvent): void {
        const key = event.key.toLowerCase();
        
        if (!this.currentKeys.has(key)) {
            this.currentKeys.add(key);
            this.addToBuffer({
                key,
                timestamp: performance.now(),
                processed: false
            });
        }
    }

    /**
     * Handles keyup events and removes keys from the current keys set
     */
    private handleKeyUp(event: KeyboardEvent): void {
        const key = event.key.toLowerCase();
        this.currentKeys.delete(key);
    }

    /**
     * Updates mouse position
     */
    private handleMouseMove(event: MouseEvent): void {
        this.mousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    /**
     * Adds an input action to the buffer, maintaining buffer size limits
     */
    private addToBuffer(action: InputAction): void {
        this.inputBuffer.push(action);
        
        if (this.inputBuffer.length > this.maxBufferSize) {
            this.inputBuffer.shift();
        }
    }

    /**
     * Updates the input system and processes buffered inputs
     */
    public update(): void {
        const currentTime = performance.now();
        
        // Process and clean up buffer
        this.inputBuffer.forEach((action, index) => {
            if (!action.processed && 
                currentTime - action.timestamp <= this.bufferTimeWindow) {
                this.processBufferedInput(action);
                action.processed = true;
            }
        });

        // Remove old processed inputs
        this.cleanBuffer(currentTime);
        
        this.lastUpdateTime = currentTime;
    }

    /**
     * Processes a buffered input action
     */
    private processBufferedInput(action: InputAction): void {
        // Implementation would depend on game-specific input handling
        // This is where you would trigger the actual game actions
    }

    /**
     * Removes old processed inputs from the buffer
     */
    private cleanBuffer(currentTime: number): void {
        const cutoffTime = currentTime - this.bufferTimeWindow;
        this.inputBuffer = this.inputBuffer.filter(action => 
            !action.processed || action.timestamp >= cutoffTime
        );
    }

    /**
     * Checks if a key is currently pressed
     */
    public isKeyPressed(key: string): boolean {
        return this.currentKeys.has(key.toLowerCase());
    }

    /**
     * Gets the current mouse position
     */
    public getMousePosition(): Vector2 {
        return { ...this.mousePosition };
    }

    /**
     * Sets the buffer time window
     */
    public setBufferTimeWindow(timeMs: number): void {
        if (timeMs >= 0) {
            this.bufferTimeWindow = timeMs;
        } else {
            throw new Error('Buffer time window must be non-negative');
        }
    }

    /**
     * Clears all input states
     */
    public clear(): void {
        this.currentKeys.clear();
        this.inputBuffer.length = 0;
        this.mousePosition = { x: 0, y: 0 };
    }
}

export default InputManager;