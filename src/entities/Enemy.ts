/**
 * @file Enemy.ts
 * @description Defines the Enemy entity and related types for the wave system
 * @module entities/Enemy
 */

// =========== Types & Interfaces ===========

/**
 * Enemy configuration properties
 */
interface EnemyConfig {
  health: number;
  speed: number;
  damage: number;
  scoreValue: number;
  type: EnemyType;
}

/**
 * Supported enemy types
 */
enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank',
  BOSS = 'boss'
}

/**
 * Position vector type
 */
interface Vector2D {
  x: number;
  y: number;
}

// =========== Constants ===========

const DEFAULT_ENEMY_CONFIG: Record<EnemyType, EnemyConfig> = {
  [EnemyType.BASIC]: {
    health: 100,
    speed: 1,
    damage: 10,
    scoreValue: 100,
    type: EnemyType.BASIC
  },
  [EnemyType.FAST]: {
    health: 50,
    speed: 2,
    damage: 5,
    scoreValue: 150,
    type: EnemyType.FAST
  },
  [EnemyType.TANK]: {
    health: 200,
    speed: 0.5,
    damage: 15,
    scoreValue: 200,
    type: EnemyType.TANK
  },
  [EnemyType.BOSS]: {
    health: 500,
    speed: 0.3,
    damage: 25,
    scoreValue: 1000,
    type: EnemyType.BOSS
  }
};

// =========== Main Class ===========

/**
 * Represents an enemy entity in the game
 */
export class Enemy {
  private position: Vector2D;
  private currentHealth: number;
  private isActive: boolean;
  private config: EnemyConfig;

  /**
   * Creates a new Enemy instance
   * @param type - The type of enemy to create
   * @param startPosition - Initial spawn position
   * @throws {Error} If invalid enemy type is provided
   */
  constructor(type: EnemyType, startPosition: Vector2D) {
    if (!Object.values(EnemyType).includes(type)) {
      throw new Error(`Invalid enemy type: ${type}`);
    }

    this.config = { ...DEFAULT_ENEMY_CONFIG[type] };
    this.position = { ...startPosition };
    this.currentHealth = this.config.health;
    this.isActive = true;
  }

  /**
   * Updates the enemy's position and state
   * @param deltaTime - Time elapsed since last update
   * @param targetPosition - Position to move towards
   */
  public update(deltaTime: number, targetPosition: Vector2D): void {
    if (!this.isActive) return;

    this.moveTowardsTarget(targetPosition, deltaTime);
    this.checkHealth();
  }

  /**
   * Applies damage to the enemy
   * @param amount - Amount of damage to apply
   * @returns boolean - Whether the enemy was defeated
   */
  public takeDamage(amount: number): boolean {
    if (!this.isActive) return false;

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    const wasDefeated = this.currentHealth <= 0;

    if (wasDefeated) {
      this.defeat();
    }

    return wasDefeated;
  }

  /**
   * Gets the current position of the enemy
   */
  public getPosition(): Vector2D {
    return { ...this.position };
  }

  /**
   * Gets the current state of the enemy
   */
  public getState(): {
    health: number;
    isActive: boolean;
    type: EnemyType;
    scoreValue: number;
  } {
    return {
      health: this.currentHealth,
      isActive: this.isActive,
      type: this.config.type,
      scoreValue: this.config.scoreValue
    };
  }

  // =========== Private Methods ===========

  /**
   * Moves the enemy towards the target position
   */
  private moveTowardsTarget(target: Vector2D, deltaTime: number): void {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const speed = this.config.speed * deltaTime;
      const movement = Math.min(speed, distance);
      const ratio = movement / distance;

      this.position.x += dx * ratio;
      this.position.y += dy * ratio;
    }
  }

  /**
   * Checks enemy health and updates state accordingly
   */
  private checkHealth(): void {
    if (this.currentHealth <= 0) {
      this.defeat();
    }
  }

  /**
   * Handles enemy defeat
   */
  private defeat(): void {
    this.isActive = false;
    this.currentHealth = 0;
  }
}

// =========== Factory Function ===========

/**
 * Creates an enemy of the specified type at the given position
 */
export function createEnemy(type: EnemyType, position: Vector2D): Enemy {
  try {
    return new Enemy(type, position);
  } catch (error) {
    console.error(`Failed to create enemy: ${error.message}`);
    throw error;
  }
}