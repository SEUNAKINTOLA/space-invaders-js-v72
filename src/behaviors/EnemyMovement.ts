/**
 * @file EnemyMovement.ts
 * @description Implements various enemy movement behavior patterns using the Strategy pattern.
 * Each movement pattern can be used interchangeably for different enemy types.
 */

// Types and interfaces
interface Position {
  x: number;
  y: number;
}

interface MovementBehavior {
  move(currentPosition: Position, deltaTime: number): Position;
  reset(): void;
}

/**
 * Configuration constants for movement patterns
 */
const MOVEMENT_CONFIG = {
  LINEAR_SPEED: 100,
  SINE_AMPLITUDE: 50,
  SINE_FREQUENCY: 2,
  CIRCULAR_RADIUS: 100,
  CIRCULAR_SPEED: 2,
  ZIGZAG_DISTANCE: 50,
  ZIGZAG_INTERVAL: 1000,
} as const;

/**
 * Implements linear movement behavior
 */
export class LinearMovement implements MovementBehavior {
  private speed: number;
  private direction: Position;

  constructor(speed: number = MOVEMENT_CONFIG.LINEAR_SPEED, direction: Position = { x: 1, y: 0 }) {
    this.speed = speed;
    this.direction = this.normalizeDirection(direction);
  }

  /**
   * Moves in a straight line based on direction and speed
   */
  public move(currentPosition: Position, deltaTime: number): Position {
    return {
      x: currentPosition.x + this.direction.x * this.speed * deltaTime,
      y: currentPosition.y + this.direction.y * this.speed * deltaTime
    };
  }

  public reset(): void {
    // Reset not needed for linear movement
  }

  private normalizeDirection(direction: Position): Position {
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    return {
      x: direction.x / magnitude,
      y: direction.y / magnitude
    };
  }
}

/**
 * Implements sine wave movement behavior
 */
export class SineWaveMovement implements MovementBehavior {
  private amplitude: number;
  private frequency: number;
  private time: number;

  constructor(
    amplitude: number = MOVEMENT_CONFIG.SINE_AMPLITUDE,
    frequency: number = MOVEMENT_CONFIG.SINE_FREQUENCY
  ) {
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.time = 0;
  }

  public move(currentPosition: Position, deltaTime: number): Position {
    this.time += deltaTime;
    return {
      x: currentPosition.x + MOVEMENT_CONFIG.LINEAR_SPEED * deltaTime,
      y: currentPosition.y + this.amplitude * 
         Math.sin(this.time * this.frequency)
    };
  }

  public reset(): void {
    this.time = 0;
  }
}

/**
 * Implements circular movement behavior
 */
export class CircularMovement implements MovementBehavior {
  private radius: number;
  private speed: number;
  private angle: number;
  private center: Position | null;

  constructor(
    radius: number = MOVEMENT_CONFIG.CIRCULAR_RADIUS,
    speed: number = MOVEMENT_CONFIG.CIRCULAR_SPEED
  ) {
    this.radius = radius;
    this.speed = speed;
    this.angle = 0;
    this.center = null;
  }

  public move(currentPosition: Position, deltaTime: number): Position {
    if (!this.center) {
      this.center = { ...currentPosition };
    }

    this.angle += this.speed * deltaTime;

    return {
      x: this.center.x + this.radius * Math.cos(this.angle),
      y: this.center.y + this.radius * Math.sin(this.angle)
    };
  }

  public reset(): void {
    this.angle = 0;
    this.center = null;
  }
}

/**
 * Implements zigzag movement behavior
 */
export class ZigzagMovement implements MovementBehavior {
  private distance: number;
  private interval: number;
  private elapsed: number;
  private goingUp: boolean;

  constructor(
    distance: number = MOVEMENT_CONFIG.ZIGZAG_DISTANCE,
    interval: number = MOVEMENT_CONFIG.ZIGZAG_INTERVAL
  ) {
    this.distance = distance;
    this.interval = interval;
    this.elapsed = 0;
    this.goingUp = true;
  }

  public move(currentPosition: Position, deltaTime: number): Position {
    this.elapsed += deltaTime * 1000; // Convert to milliseconds

    if (this.elapsed >= this.interval) {
      this.elapsed = 0;
      this.goingUp = !this.goingUp;
    }

    const progress = this.elapsed / this.interval;
    const verticalMove = this.goingUp ? 
      this.distance * progress : 
      this.distance * (1 - progress);

    return {
      x: currentPosition.x + MOVEMENT_CONFIG.LINEAR_SPEED * deltaTime,
      y: currentPosition.y + verticalMove
    };
  }

  public reset(): void {
    this.elapsed = 0;
    this.goingUp = true;
  }
}

/**
 * Factory for creating movement behaviors
 */
export class MovementBehaviorFactory {
  public static create(type: string, options?: any): MovementBehavior {
    switch (type.toLowerCase()) {
      case 'linear':
        return new LinearMovement(options?.speed, options?.direction);
      case 'sine':
        return new SineWaveMovement(options?.amplitude, options?.frequency);
      case 'circular':
        return new CircularMovement(options?.radius, options?.speed);
      case 'zigzag':
        return new ZigzagMovement(options?.distance, options?.interval);
      default:
        throw new Error(`Unknown movement behavior type: ${type}`);
    }
  }
}