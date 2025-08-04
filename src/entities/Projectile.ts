/**
 * @file Projectile.ts
 * @description Implements projectile entity for shooting mechanics in the game
 * @module entities/Projectile
 */

import { Vector2 } from '../types/Vector2';
import { Entity } from './Entity';
import { GameContext } from '../core/GameContext';

/**
 * Configuration constants for projectiles
 */
const PROJECTILE_CONFIG = {
  DEFAULT_SPEED: 500,
  DEFAULT_SIZE: 5,
  MAX_DISTANCE: 1000,
  CLEANUP_THRESHOLD: 50,
} as const;

/**
 * Represents projectile properties
 */
interface ProjectileProps {
  position: Vector2;
  direction: Vector2;
  speed?: number;
  damage?: number;
  size?: number;
  sourceId?: string;
}

/**
 * Represents a projectile entity in the game
 * Handles movement, collision detection, and lifecycle management
 */
export class Projectile extends Entity {
  private direction: Vector2;
  private speed: number;
  private damage: number;
  private distanceTraveled: number;
  private sourceId: string;
  private size: number;

  /**
   * Creates a new projectile instance
   * @param props - Projectile initialization properties
   * @throws {Error} If position or direction are invalid
   */
  constructor(props: ProjectileProps) {
    super({ id: crypto.randomUUID() });

    if (!this.isValidVector(props.position) || !this.isValidVector(props.direction)) {
      throw new Error('Invalid position or direction vectors');
    }

    this.position = props.position;
    this.direction = this.normalizeVector(props.direction);
    this.speed = props.speed ?? PROJECTILE_CONFIG.DEFAULT_SPEED;
    this.damage = props.damage ?? 1;
    this.size = props.size ?? PROJECTILE_CONFIG.DEFAULT_SIZE;
    this.sourceId = props.sourceId ?? '';
    this.distanceTraveled = 0;
  }

  /**
   * Updates projectile position and checks for cleanup conditions
   * @param deltaTime - Time elapsed since last update
   * @param context - Game context for collision detection
   * @returns boolean indicating if the projectile should be destroyed
   */
  public update(deltaTime: number, context: GameContext): boolean {
    // Update position
    const movement = {
      x: this.direction.x * this.speed * deltaTime,
      y: this.direction.y * this.speed * deltaTime
    };

    this.position.x += movement.x;
    this.position.y += movement.y;

    // Update distance traveled
    this.distanceTraveled += Math.sqrt(movement.x ** 2 + movement.y ** 2);

    // Check if projectile should be destroyed
    if (this.shouldDestroy(context)) {
      return true;
    }

    return false;
  }

  /**
   * Renders the projectile
   * @param context - Rendering context
   */
  public render(context: CanvasRenderingContext2D): void {
    context.save();
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    context.fillStyle = '#ffffff';
    context.fill();
    context.restore();
  }

  /**
   * Gets the damage value of the projectile
   */
  public getDamage(): number {
    return this.damage;
  }

  /**
   * Gets the source entity ID that created this projectile
   */
  public getSourceId(): string {
    return this.sourceId;
  }

  /**
   * Checks if the projectile should be destroyed
   * @param context - Game context for boundary checking
   */
  private shouldDestroy(context: GameContext): boolean {
    // Check maximum distance
    if (this.distanceTraveled >= PROJECTILE_CONFIG.MAX_DISTANCE) {
      return true;
    }

    // Check if out of bounds
    const bounds = context.getBounds();
    if (
      this.position.x < -PROJECTILE_CONFIG.CLEANUP_THRESHOLD ||
      this.position.x > bounds.width + PROJECTILE_CONFIG.CLEANUP_THRESHOLD ||
      this.position.y < -PROJECTILE_CONFIG.CLEANUP_THRESHOLD ||
      this.position.y > bounds.height + PROJECTILE_CONFIG.CLEANUP_THRESHOLD
    ) {
      return true;
    }

    return false;
  }

  /**
   * Validates a vector object
   */
  private isValidVector(vector: Vector2): boolean {
    return (
      vector &&
      typeof vector.x === 'number' &&
      typeof vector.y === 'number' &&
      !isNaN(vector.x) &&
      !isNaN(vector.y)
    );
  }

  /**
   * Normalizes a vector to have magnitude of 1
   */
  private normalizeVector(vector: Vector2): Vector2 {
    const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);
    return {
      x: vector.x / magnitude,
      y: vector.y / magnitude
    };
  }
}