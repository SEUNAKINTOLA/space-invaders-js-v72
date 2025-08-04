/**
 * @file Particle.ts
 * @description Implements a reusable particle system for creating visual effects.
 * Handles particle creation, lifecycle management, and rendering properties.
 * 
 * @module effects/Particle
 * @author AI Assistant
 * @version 1.0.0
 */

// Types and interfaces
interface ParticleOptions {
  x: number;
  y: number;
  velocity?: Vector2D;
  lifespan?: number;
  color?: string;
  size?: number;
}

interface Vector2D {
  x: number;
  y: number;
}

/**
 * Default configuration for particles
 */
const DEFAULT_PARTICLE_CONFIG = {
  lifespan: 1000, // milliseconds
  size: 5,
  color: '#ffffff',
  velocity: { x: 0, y: 0 },
} as const;

/**
 * Represents a single particle in the particle system
 */
export class Particle {
  private position: Vector2D;
  private velocity: Vector2D;
  private acceleration: Vector2D;
  private readonly initialLifespan: number;
  private currentLifespan: number;
  private color: string;
  private size: number;
  private isActive: boolean;

  /**
   * Creates a new particle instance
   * @param options - Configuration options for the particle
   * @throws {Error} If invalid position coordinates are provided
   */
  constructor(options: ParticleOptions) {
    if (!this.validateOptions(options)) {
      throw new Error('Invalid particle options provided');
    }

    this.position = { x: options.x, y: options.y };
    this.velocity = options.velocity || { ...DEFAULT_PARTICLE_CONFIG.velocity };
    this.acceleration = { x: 0, y: 0 };
    this.initialLifespan = options.lifespan || DEFAULT_PARTICLE_CONFIG.lifespan;
    this.currentLifespan = this.initialLifespan;
    this.color = options.color || DEFAULT_PARTICLE_CONFIG.color;
    this.size = options.size || DEFAULT_PARTICLE_CONFIG.size;
    this.isActive = true;
  }

  /**
   * Updates the particle's state for the current frame
   * @param deltaTime - Time elapsed since last update in milliseconds
   * @returns boolean indicating if the particle is still active
   */
  public update(deltaTime: number): boolean {
    if (!this.isActive) return false;

    this.currentLifespan -= deltaTime;

    if (this.currentLifespan <= 0) {
      this.isActive = false;
      return false;
    }

    // Update velocity with acceleration
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;

    // Update position with velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    return true;
  }

  /**
   * Applies a force to the particle
   * @param force - Force vector to apply
   */
  public applyForce(force: Vector2D): void {
    this.acceleration.x += force.x;
    this.acceleration.y += force.y;
  }

  /**
   * Gets the current opacity based on remaining lifespan
   * @returns number between 0 and 1
   */
  public getOpacity(): number {
    return Math.max(0, Math.min(1, this.currentLifespan / this.initialLifespan));
  }

  /**
   * Gets the current state of the particle
   * @returns Object containing particle state
   */
  public getState(): {
    position: Vector2D;
    size: number;
    color: string;
    opacity: number;
    isActive: boolean;
  } {
    return {
      position: { ...this.position },
      size: this.size,
      color: this.color,
      opacity: this.getOpacity(),
      isActive: this.isActive,
    };
  }

  /**
   * Validates particle options
   * @param options - Particle options to validate
   * @returns boolean indicating if options are valid
   * @private
   */
  private validateOptions(options: ParticleOptions): boolean {
    if (typeof options.x !== 'number' || typeof options.y !== 'number') {
      return false;
    }

    if (options.lifespan !== undefined && options.lifespan <= 0) {
      return false;
    }

    if (options.size !== undefined && options.size <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Resets the particle with new options
   * @param options - New configuration options
   */
  public reset(options: ParticleOptions): void {
    if (!this.validateOptions(options)) {
      throw new Error('Invalid reset options provided');
    }

    this.position = { x: options.x, y: options.y };
    this.velocity = options.velocity || { ...DEFAULT_PARTICLE_CONFIG.velocity };
    this.acceleration = { x: 0, y: 0 };
    this.currentLifespan = options.lifespan || this.initialLifespan;
    this.isActive = true;
  }
}

/**
 * Utility function to create a random velocity vector
 * @param maxSpeed - Maximum speed for the particle
 * @returns Random velocity vector
 */
export function createRandomVelocity(maxSpeed: number): Vector2D {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * maxSpeed;
  return {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed,
  };
}