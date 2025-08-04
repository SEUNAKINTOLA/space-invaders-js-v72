/**
 * @file Sprite.ts
 * @description Implements a sprite rendering system for game objects.
 * Handles sprite creation, management, and rendering with support for
 * animations and transformations.
 */

// =========================================================
// Types and Interfaces
// =========================================================

/**
 * Configuration options for creating a sprite
 */
export interface SpriteConfig {
  imageSource: string;
  width: number;
  height: number;
  frameCount?: number;
  frameRate?: number;
  scale?: number;
}

/**
 * Represents the current state of a sprite
 */
export interface SpriteState {
  currentFrame: number;
  lastFrameUpdate: number;
  isAnimating: boolean;
}

// =========================================================
// Main Sprite Class
// =========================================================

export class Sprite {
  private image: HTMLImageElement;
  private config: SpriteConfig;
  private state: SpriteState;
  private loaded: boolean;
  private errorState: Error | null;

  /**
   * Creates a new Sprite instance
   * @param config - Configuration options for the sprite
   */
  constructor(config: SpriteConfig) {
    this.config = {
      frameCount: 1,
      frameRate: 0,
      scale: 1,
      ...config
    };

    this.state = {
      currentFrame: 0,
      lastFrameUpdate: 0,
      isAnimating: false
    };

    this.loaded = false;
    this.errorState = null;
    this.image = new Image();
    
    this.initializeImage();
  }

  /**
   * Initializes the sprite image with error handling
   * @private
   */
  private initializeImage(): void {
    this.image.onload = () => {
      this.loaded = true;
    };

    this.image.onerror = (error) => {
      this.errorState = new Error(`Failed to load sprite image: ${error}`);
      console.error(this.errorState);
    };

    try {
      this.image.src = this.config.imageSource;
    } catch (error) {
      this.errorState = error instanceof Error ? error : new Error('Unknown error loading sprite');
      console.error(this.errorState);
    }
  }

  /**
   * Renders the sprite to the canvas context
   * @param context - The 2D rendering context
   * @param x - X coordinate for rendering
   * @param y - Y coordinate for rendering
   */
  public render(context: CanvasRenderingContext2D, x: number, y: number): void {
    if (!this.loaded || this.errorState) {
      return;
    }

    const frameWidth = this.config.width;
    const sourceX = this.state.currentFrame * frameWidth;

    try {
      context.drawImage(
        this.image,
        sourceX,
        0,
        this.config.width,
        this.config.height,
        x,
        y,
        this.config.width * (this.config.scale || 1),
        this.config.height * (this.config.scale || 1)
      );
    } catch (error) {
      console.error('Error rendering sprite:', error);
    }
  }

  /**
   * Updates the sprite animation state
   * @param timestamp - Current game timestamp
   */
  public update(timestamp: number): void {
    if (!this.state.isAnimating || !this.config.frameRate) {
      return;
    }

    const frameInterval = 1000 / this.config.frameRate;
    if (timestamp - this.state.lastFrameUpdate >= frameInterval) {
      this.state.currentFrame = (this.state.currentFrame + 1) % (this.config.frameCount || 1);
      this.state.lastFrameUpdate = timestamp;
    }
  }

  /**
   * Starts sprite animation
   */
  public startAnimation(): void {
    this.state.isAnimating = true;
    this.state.lastFrameUpdate = performance.now();
  }

  /**
   * Stops sprite animation
   */
  public stopAnimation(): void {
    this.state.isAnimating = false;
  }

  /**
   * Sets the current frame of the sprite
   * @param frame - Frame number to set
   */
  public setFrame(frame: number): void {
    if (frame >= 0 && frame < (this.config.frameCount || 1)) {
      this.state.currentFrame = frame;
    }
  }

  /**
   * Checks if the sprite is ready for rendering
   * @returns Boolean indicating if sprite is loaded and error-free
   */
  public isReady(): boolean {
    return this.loaded && !this.errorState;
  }

  /**
   * Gets the current error state of the sprite
   * @returns Current error or null if no error
   */
  public getError(): Error | null {
    return this.errorState;
  }

  /**
   * Gets the dimensions of the sprite
   * @returns Object containing width and height
   */
  public getDimensions(): { width: number; height: number } {
    return {
      width: this.config.width * (this.config.scale || 1),
      height: this.config.height * (this.config.scale || 1)
    };
  }
}