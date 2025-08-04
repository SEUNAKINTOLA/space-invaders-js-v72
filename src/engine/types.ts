/**
 * @file types.ts
 * @description Type definitions and interfaces for the Canvas rendering system.
 * These types provide the foundation for implementing canvas-based rendering
 * capabilities across the engine.
 * 
 * @module engine/types
 * @version 1.0.0
 */

// =========================================================================
// Basic Types
// =========================================================================

/**
 * Represents a 2D point or vector with x and y coordinates
 */
export type Point2D = {
  x: number;
  y: number;
};

/**
 * Represents dimensions with width and height
 */
export type Dimensions = {
  width: number;
  height: number;
};

/**
 * Represents RGBA color values
 */
export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

// =========================================================================
// Rendering Interfaces
// =========================================================================

/**
 * Configuration options for canvas initialization
 */
export interface CanvasConfig {
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Canvas element ID */
  elementId?: string;
  /** Anti-aliasing setting */
  antialias?: boolean;
  /** Background color */
  backgroundColor?: Color;
}

/**
 * Defines the basic properties of a renderable object
 */
export interface IRenderableObject {
  position: Point2D;
  dimensions: Dimensions;
  rotation?: number;
  visible: boolean;
  opacity: number;
  zIndex: number;
}

/**
 * Defines the core rendering context capabilities
 */
export interface IRenderingContext {
  /** The underlying canvas context */
  context: CanvasRenderingContext2D;
  /** Canvas dimensions */
  dimensions: Dimensions;
  /** Clears the entire canvas */
  clear(): void;
  /** Begins a new render frame */
  beginFrame(): void;
  /** Ends the current render frame */
  endFrame(): void;
}

/**
 * Defines drawable object capabilities
 */
export interface IDrawable {
  /** Draws the object to the specified rendering context */
  draw(context: IRenderingContext): void;
  /** Updates the object's state */
  update(deltaTime: number): void;
}

// =========================================================================
// Render State Types
// =========================================================================

/**
 * Represents the current state of the rendering system
 */
export type RenderState = {
  /** Current frame number */
  frameCount: number;
  /** Time elapsed since last frame (ms) */
  deltaTime: number;
  /** Total elapsed time (ms) */
  totalTime: number;
  /** Current FPS */
  fps: number;
  /** Whether rendering is paused */
  isPaused: boolean;
};

/**
 * Defines render layer configuration
 */
export interface RenderLayer {
  /** Unique layer identifier */
  id: string;
  /** Layer name */
  name: string;
  /** Layer visibility */
  visible: boolean;
  /** Layer opacity (0-1) */
  opacity: number;
  /** Layer blend mode */
  blendMode: GlobalCompositeOperation;
  /** Objects in this layer */
  objects: IRenderableObject[];
}

// =========================================================================
// Error Types
// =========================================================================

/**
 * Custom error type for canvas-related errors
 */
export class CanvasError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CanvasError';
  }
}

// =========================================================================
// Utility Types
// =========================================================================

/**
 * Represents a transformation matrix
 */
export type Transform2D = [
  number, number, number,
  number, number, number
];

/**
 * Defines supported blend modes
 */
export type BlendMode = Extract<GlobalCompositeOperation,
  | 'source-over'
  | 'source-in'
  | 'source-out'
  | 'source-atop'
  | 'destination-over'
  | 'destination-in'
  | 'destination-out'
  | 'destination-atop'
  | 'lighter'
  | 'copy'
  | 'xor'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'
>;

/**
 * Type guard to check if a value is a valid Point2D
 */
export function isPoint2D(value: unknown): value is Point2D {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    typeof (value as Point2D).x === 'number' &&
    typeof (value as Point2D).y === 'number'
  );
}

/**
 * Type guard to check if a value is a valid Color
 */
export function isColor(value: unknown): value is Color {
  return (
    typeof value === 'object' &&
    value !== null &&
    'r' in value &&
    'g' in value &&
    'b' in value &&
    'a' in value &&
    typeof (value as Color).r === 'number' &&
    typeof (value as Color).g === 'number' &&
    typeof (value as Color).b === 'number' &&
    typeof (value as Color).a === 'number'
  );
}