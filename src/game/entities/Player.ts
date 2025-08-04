/**
 * @file Player.ts
 * @description Player ship entity implementation including rendering and basic functionality
 * @module game/entities/Player
 */

import { Vector2D } from '../types/Vector2D';
import { Sprite } from '../graphics/Sprite';
import { Renderable } from '../interfaces/Renderable';
import { Entity } from '../interfaces/Entity';
import { GameContext } from '../core/GameContext';

/**
 * Configuration constants for the player ship
 */
const PLAYER_CONFIG = {
  DEFAULT_SPEED: 5,
  ROTATION_SPEED: 0.1,
  INITIAL_HEALTH: 100,
  SPRITE_SIZE: {
    width: 32,
    height: 32,
  },
} as const;

/**
 * Represents the player's ship in the game
 * @implements {Entity}
 * @implements {Renderable}
 */
export class Player implements Entity, Renderable {
  private position: Vector2D;
  private velocity: Vector2D;
  private rotation: number;
  private sprite: Sprite;
  private health: number;
  private isActive: boolean;

  /**
   * Creates a new Player instance
   * @param {GameContext} context - The game context
   * @param {Vector2D} initialPosition - Starting position for the player
   */
  constructor(
    private readonly context: GameContext,
    initialPosition: Vector2D = { x: 0, y: 0 }
  ) {
    this.position = { ...initialPosition };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.health = PLAYER_CONFIG.INITIAL_HEALTH;
    this.isActive = true;

    this.initializeSprite();
  }

  /**
   * Initializes the player's sprite
   * @private
   * @throws {Error} If sprite initialization fails
   */
  private initializeSprite(): void {
    try {
      this.sprite = new Sprite({
        width: PLAYER_CONFIG.SPRITE_SIZE.width,
        height: PLAYER_CONFIG.SPRITE_SIZE.height,
        imagePath: 'assets/player-ship.png',
      });
    } catch (error) {
      console.error('Failed to initialize player sprite:', error);
      throw new Error('Player sprite initialization failed');
    }
  }

  /**
   * Updates the player's state
   * @param {number} deltaTime - Time elapsed since last update
   */
  public update(deltaTime: number): void {
    if (!this.isActive) return;

    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime * PLAYER_CONFIG.DEFAULT_SPEED;
    this.position.y += this.velocity.y * deltaTime * PLAYER_CONFIG.DEFAULT_SPEED;

    // Keep player within game bounds
    this.constrainToBounds();
  }

  /**
   * Renders the player
   * @param {CanvasRenderingContext2D} ctx - The rendering context
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isActive || !this.sprite) return;

    ctx.save();
    
    // Transform context for rotation
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    
    // Draw the sprite
    this.sprite.draw(
      ctx,
      -PLAYER_CONFIG.SPRITE_SIZE.width / 2,
      -PLAYER_CONFIG.SPRITE_SIZE.height / 2
    );

    ctx.restore();
  }

  /**
   * Sets the player's velocity
   * @param {Vector2D} newVelocity - New velocity vector
   */
  public setVelocity(newVelocity: Vector2D): void {
    this.velocity = { ...newVelocity };
  }

  /**
   * Rotates the player
   * @param {number} angle - Rotation angle in radians
   */
  public rotate(angle: number): void {
    this.rotation += angle * PLAYER_CONFIG.ROTATION_SPEED;
  }

  /**
   * Applies damage to the player
   * @param {number} amount - Amount of damage to apply
   * @returns {boolean} Whether the player is still alive
   */
  public takeDamage(amount: number): boolean {
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) {
      this.isActive = false;
    }
    return this.isActive;
  }

  /**
   * Keeps the player within game bounds
   * @private
   */
  private constrainToBounds(): void {
    const bounds = this.context.getBounds();
    
    this.position.x = Math.max(0, Math.min(this.position.x, bounds.width));
    this.position.y = Math.max(0, Math.min(this.position.y, bounds.height));
  }

  /**
   * Gets the player's current position
   * @returns {Vector2D} Current position
   */
  public getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Gets the player's current health
   * @returns {number} Current health
   */
  public getHealth(): number {
    return this.health;
  }

  /**
   * Checks if the player is active
   * @returns {boolean} Player active status
   */
  public isPlayerActive(): boolean {
    return this.isActive;
  }
}