/**
 * @file TouchController.ts
 * @description Handles touch input detection and processing for player movement
 * @module input/TouchController
 */

/**
 * Interface representing a touch position
 */
interface TouchPosition {
  x: number;
  y: number;
}

/**
 * Interface for touch movement data
 */
interface TouchMovement {
  deltaX: number;
  deltaY: number;
  magnitude: number;
  direction: number;
}

/**
 * Configuration options for touch controls
 */
interface TouchControllerConfig {
  touchThreshold: number;
  maxTouchDistance: number;
  element: HTMLElement;
}

/**
 * Class responsible for handling touch input controls
 */
export class TouchController {
  private readonly config: TouchControllerConfig;
  private startTouch: TouchPosition | null = null;
  private currentTouch: TouchPosition | null = null;
  private isActive: boolean = false;
  private touchListeners: ((movement: TouchMovement) => void)[] = [];

  /**
   * Creates a new TouchController instance
   * @param config - Configuration options for the touch controller
   */
  constructor(config: Partial<TouchControllerConfig> = {}) {
    this.config = {
      touchThreshold: 10,
      maxTouchDistance: 100,
      element: document.body,
      ...config
    };

    this.initialize();
  }

  /**
   * Initializes touch event listeners
   * @private
   */
  private initialize(): void {
    try {
      this.config.element.addEventListener('touchstart', this.handleTouchStart);
      this.config.element.addEventListener('touchmove', this.handleTouchMove);
      this.config.element.addEventListener('touchend', this.handleTouchEnd);
    } catch (error) {
      console.error('Failed to initialize touch controls:', error);
      throw new Error('Touch controller initialization failed');
    }
  }

  /**
   * Handles the touch start event
   * @private
   */
  private handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.startTouch = {
        x: touch.clientX,
        y: touch.clientY
      };
      this.currentTouch = { ...this.startTouch };
      this.isActive = true;
    }
  };

  /**
   * Handles the touch move event
   * @private
   */
  private handleTouchMove = (event: TouchEvent): void => {
    event.preventDefault();

    if (!this.isActive || !this.startTouch) return;

    const touch = event.touches[0];
    this.currentTouch = {
      x: touch.clientX,
      y: touch.clientY
    };

    const movement = this.calculateMovement();
    if (movement) {
      this.notifyListeners(movement);
    }
  };

  /**
   * Handles the touch end event
   * @private
   */
  private handleTouchEnd = (event: TouchEvent): void => {
    event.preventDefault();
    this.reset();
  };

  /**
   * Calculates touch movement data
   * @private
   * @returns TouchMovement object or null if movement is below threshold
   */
  private calculateMovement(): TouchMovement | null {
    if (!this.startTouch || !this.currentTouch) return null;

    const deltaX = this.currentTouch.x - this.startTouch.x;
    const deltaY = this.currentTouch.y - this.startTouch.y;
    const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (magnitude < this.config.touchThreshold) return null;

    const clampedMagnitude = Math.min(magnitude, this.config.maxTouchDistance);
    const direction = Math.atan2(deltaY, deltaX);

    return {
      deltaX: deltaX / magnitude * clampedMagnitude,
      deltaY: deltaY / magnitude * clampedMagnitude,
      magnitude: clampedMagnitude,
      direction
    };
  }

  /**
   * Resets the touch controller state
   * @private
   */
  private reset(): void {
    this.startTouch = null;
    this.currentTouch = null;
    this.isActive = false;
  }

  /**
   * Adds a touch movement listener
   * @param listener - Callback function to handle touch movement
   */
  public addTouchListener(listener: (movement: TouchMovement) => void): void {
    this.touchListeners.push(listener);
  }

  /**
   * Removes a touch movement listener
   * @param listener - Listener to remove
   */
  public removeTouchListener(listener: (movement: TouchMovement) => void): void {
    const index = this.touchListeners.indexOf(listener);
    if (index !== -1) {
      this.touchListeners.splice(index, 1);
    }
  }

  /**
   * Notifies all listeners of touch movement
   * @private
   */
  private notifyListeners(movement: TouchMovement): void {
    this.touchListeners.forEach(listener => {
      try {
        listener(movement);
      } catch (error) {
        console.error('Error in touch movement listener:', error);
      }
    });
  }

  /**
   * Cleans up the touch controller
   */
  public dispose(): void {
    try {
      this.config.element.removeEventListener('touchstart', this.handleTouchStart);
      this.config.element.removeEventListener('touchmove', this.handleTouchMove);
      this.config.element.removeEventListener('touchend', this.handleTouchEnd);
      this.touchListeners = [];
      this.reset();
    } catch (error) {
      console.error('Error disposing touch controller:', error);
    }
  }

  /**
   * Checks if touch input is currently active
   * @returns boolean indicating if touch is active
   */
  public isTouch(): boolean {
    return this.isActive;
  }
}