/**
 * @file KeyboardController.ts
 * @description Handles keyboard input for player movement controls
 * @module input
 */

// Types and interfaces
interface KeyState {
  [key: string]: boolean;
}

interface MovementState {
  isMovingLeft: boolean;
  isMovingRight: boolean;
}

/**
 * Configuration for keyboard controls
 */
const KEYBOARD_CONFIG = {
  LEFT_KEYS: ['ArrowLeft', 'a', 'A'],
  RIGHT_KEYS: ['ArrowRight', 'd', 'D'],
  UPDATE_INTERVAL: 16, // ~60fps
} as const;

/**
 * Handles keyboard input for player movement
 * @class KeyboardController
 */
export class KeyboardController {
  private keyState: KeyState;
  private movementState: MovementState;
  private listeners: Set<(state: MovementState) => void>;
  private isActive: boolean;

  /**
   * Creates an instance of KeyboardController
   */
  constructor() {
    this.keyState = {};
    this.movementState = {
      isMovingLeft: false,
      isMovingRight: false,
    };
    this.listeners = new Set();
    this.isActive = false;

    // Bind methods to maintain correct 'this' context
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Initializes keyboard event listeners
   * @returns {void}
   * @throws {Error} If controller is already initialized
   */
  public initialize(): void {
    if (this.isActive) {
      throw new Error('KeyboardController is already initialized');
    }

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.isActive = true;
  }

  /**
   * Cleans up keyboard event listeners
   * @returns {void}
   */
  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.listeners.clear();
    this.isActive = false;
  }

  /**
   * Subscribes to movement state changes
   * @param {function} callback - Function to call when movement state changes
   * @returns {function} Unsubscribe function
   */
  public subscribe(callback: (state: MovementState) => void): () => void {
    this.listeners.add(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Handles keydown events
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.keyState[event.key] = true;
    this.updateMovementState();
  }

  /**
   * Handles keyup events
   * @param {KeyboardEvent} event - Keyboard event
   * @private
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.keyState[event.key] = false;
    this.updateMovementState();
  }

  /**
   * Updates the movement state based on current key state
   * @private
   */
  private updateMovementState(): void {
    const previousState = { ...this.movementState };
    
    this.movementState.isMovingLeft = KEYBOARD_CONFIG.LEFT_KEYS.some(
      key => this.keyState[key]
    );
    
    this.movementState.isMovingRight = KEYBOARD_CONFIG.RIGHT_KEYS.some(
      key => this.keyState[key]
    );

    // Only notify listeners if state has changed
    if (
      previousState.isMovingLeft !== this.movementState.isMovingLeft ||
      previousState.isMovingRight !== this.movementState.isMovingRight
    ) {
      this.notifyListeners();
    }
  }

  /**
   * Notifies all subscribers of movement state changes
   * @private
   */
  private notifyListeners(): void {
    const state = { ...this.movementState };
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in movement state listener:', error);
      }
    });
  }

  /**
   * Gets the current movement state
   * @returns {MovementState} Current movement state
   */
  public getMovementState(): MovementState {
    return { ...this.movementState };
  }

  /**
   * Checks if the controller is currently active
   * @returns {boolean} True if controller is active
   */
  public isInitialized(): boolean {
    return this.isActive;
  }
}

// Export default instance
export default new KeyboardController();