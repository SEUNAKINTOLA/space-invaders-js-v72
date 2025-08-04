/**
 * @file Canvas.ts
 * @description Core Canvas rendering system implementation providing basic drawing capabilities
 * and canvas management functionality.
 * @module engine/Canvas
 */

// Types and interfaces
interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  id?: string;
}

interface DrawOptions {
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
}

/**
 * Custom error class for Canvas-related errors
 */
class CanvasError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CanvasError';
  }
}

/**
 * Canvas class providing core rendering capabilities
 */
export class Canvas {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D | null;
  private width: number;
  private height: number;
  
  /**
   * Creates a new Canvas instance
   * @param config - Canvas configuration options
   * @throws {CanvasError} If canvas creation fails
   */
  constructor(config: CanvasConfig) {
    this.width = config.width;
    this.height = config.height;
    
    try {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      
      if (config.id) {
        this.canvas.id = config.id;
      }
      
      this.context = this.canvas.getContext('2d');
      
      if (!this.context) {
        throw new CanvasError('Failed to get 2D context');
      }
      
      // Set initial background color if provided
      if (config.backgroundColor) {
        this.clear(config.backgroundColor);
      }
    } catch (error) {
      throw new CanvasError(`Failed to initialize canvas: ${error.message}`);
    }
  }
  
  /**
   * Clears the canvas with optional background color
   * @param color - Background color to fill the canvas with
   */
  public clear(color?: string): void {
    if (!this.context) return;
    
    if (color) {
      this.context.fillStyle = color;
      this.context.fillRect(0, 0, this.width, this.height);
    } else {
      this.context.clearRect(0, 0, this.width, this.height);
    }
  }
  
  /**
   * Draws a rectangle on the canvas
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param width - Rectangle width
   * @param height - Rectangle height
   * @param options - Drawing options
   */
  public drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options: DrawOptions = {}
  ): void {
    if (!this.context) return;
    
    this.context.save();
    
    if (options.fillStyle) {
      this.context.fillStyle = options.fillStyle;
      this.context.fillRect(x, y, width, height);
    }
    
    if (options.strokeStyle) {
      this.context.strokeStyle = options.strokeStyle;
      this.context.lineWidth = options.lineWidth || 1;
      this.context.strokeRect(x, y, width, height);
    }
    
    this.context.restore();
  }
  
  /**
   * Draws a circle on the canvas
   * @param x - Center X coordinate
   * @param y - Center Y coordinate
   * @param radius - Circle radius
   * @param options - Drawing options
   */
  public drawCircle(
    x: number,
    y: number,
    radius: number,
    options: DrawOptions = {}
  ): void {
    if (!this.context) return;
    
    this.context.save();
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    
    if (options.fillStyle) {
      this.context.fillStyle = options.fillStyle;
      this.context.fill();
    }
    
    if (options.strokeStyle) {
      this.context.strokeStyle = options.strokeStyle;
      this.context.lineWidth = options.lineWidth || 1;
      this.context.stroke();
    }
    
    this.context.restore();
  }
  
  /**
   * Returns the canvas element
   * @returns HTMLCanvasElement
   */
  public getElement(): HTMLCanvasElement {
    return this.canvas;
  }
  
  /**
   * Returns the canvas context
   * @returns CanvasRenderingContext2D or null
   */
  public getContext(): CanvasRenderingContext2D | null {
    return this.context;
  }
  
  /**
   * Resizes the canvas
   * @param width - New width
   * @param height - New height
   */
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
  
  /**
   * Returns the canvas dimensions
   * @returns Object containing width and height
   */
  public getDimensions(): { width: number; height: number } {
    return {
      width: this.width,
      height: this.height
    };
  }
}

export default Canvas;