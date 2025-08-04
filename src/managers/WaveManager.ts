/**
 * @file WaveManager.ts
 * @description Manages the spawning and progression of enemy waves in formations
 * @module WaveManager
 */

import { Vector2 } from '../types/Vector2';
import { Enemy } from '../entities/Enemy';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';

/**
 * Represents a formation pattern for enemy spawning
 */
interface FormationPattern {
  positions: Vector2[];
  spacing: number;
  enemyType: string;
}

/**
 * Configuration for a single wave of enemies
 */
interface WaveConfig {
  enemyCount: number;
  formation: FormationPattern;
  spawnDelay: number;
  difficulty: number;
}

/**
 * Manages the spawning and behavior of enemy waves
 */
export class WaveManager {
  private currentWave: number;
  private isSpawning: boolean;
  private enemies: Enemy[];
  private eventEmitter: EventEmitter;
  private spawnPoint: Vector2;
  private waveConfigs: WaveConfig[];

  /**
   * Creates a new WaveManager instance
   * @param spawnPoint - The point where enemies will spawn
   * @param eventEmitter - Event system for game-wide communication
   */
  constructor(spawnPoint: Vector2, eventEmitter: EventEmitter) {
    this.currentWave = 0;
    this.isSpawning = false;
    this.enemies = [];
    this.eventEmitter = eventEmitter;
    this.spawnPoint = spawnPoint;
    this.waveConfigs = this.initializeWaveConfigs();

    this.bindEvents();
  }

  /**
   * Initializes the configuration for all waves
   * @returns Array of wave configurations
   */
  private initializeWaveConfigs(): WaveConfig[] {
    try {
      return [
        {
          enemyCount: 5,
          formation: {
            positions: this.generateLineFormation(5),
            spacing: 50,
            enemyType: 'basic'
          },
          spawnDelay: 1000,
          difficulty: 1
        },
        // Add more wave configurations as needed
      ];
    } catch (error) {
      Logger.error('Failed to initialize wave configurations:', error);
      return [];
    }
  }

  /**
   * Starts spawning the next wave of enemies
   */
  public async startNextWave(): Promise<void> {
    if (this.isSpawning) {
      Logger.warn('Cannot start new wave while current wave is spawning');
      return;
    }

    try {
      this.currentWave++;
      this.isSpawning = true;
      
      const config = this.waveConfigs[this.currentWave - 1];
      if (!config) {
        throw new Error(`No configuration found for wave ${this.currentWave}`);
      }

      await this.spawnWave(config);
      
      this.eventEmitter.emit('waveComplete', this.currentWave);
    } catch (error) {
      Logger.error('Error spawning wave:', error);
      this.isSpawning = false;
    }
  }

  /**
   * Spawns a wave of enemies according to the provided configuration
   * @param config - Wave configuration
   */
  private async spawnWave(config: WaveConfig): Promise<void> {
    const { enemyCount, formation, spawnDelay } = config;

    for (let i = 0; i < enemyCount; i++) {
      try {
        const position = this.calculateSpawnPosition(formation, i);
        await this.spawnEnemy(position, formation.enemyType);
        await this.delay(spawnDelay);
      } catch (error) {
        Logger.error('Error spawning enemy:', error);
      }
    }

    this.isSpawning = false;
  }

  /**
   * Spawns a single enemy at the specified position
   * @param position - Spawn position
   * @param enemyType - Type of enemy to spawn
   */
  private async spawnEnemy(position: Vector2, enemyType: string): Promise<void> {
    try {
      const enemy = new Enemy(position, enemyType);
      this.enemies.push(enemy);
      this.eventEmitter.emit('enemySpawned', enemy);
    } catch (error) {
      Logger.error('Failed to spawn enemy:', error);
    }
  }

  /**
   * Generates positions for a line formation
   * @param count - Number of positions to generate
   * @returns Array of positions
   */
  private generateLineFormation(count: number): Vector2[] {
    const positions: Vector2[] = [];
    const spacing = 50;

    for (let i = 0; i < count; i++) {
      positions.push({
        x: this.spawnPoint.x + (i * spacing),
        y: this.spawnPoint.y
      });
    }

    return positions;
  }

  /**
   * Calculates spawn position based on formation pattern
   * @param formation - Formation pattern
   * @param index - Enemy index in formation
   * @returns Calculated position
   */
  private calculateSpawnPosition(formation: FormationPattern, index: number): Vector2 {
    if (index >= formation.positions.length) {
      return this.spawnPoint;
    }
    return formation.positions[index];
  }

  /**
   * Creates a delay using a promise
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Binds event listeners
   */
  private bindEvents(): void {
    this.eventEmitter.on('enemyDestroyed', (enemy: Enemy) => {
      this.removeEnemy(enemy);
    });
  }

  /**
   * Removes an enemy from the managed list
   * @param enemy - Enemy to remove
   */
  private removeEnemy(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }

  /**
   * Gets the current wave number
   * @returns Current wave number
   */
  public getCurrentWave(): number {
    return this.currentWave;
  }

  /**
   * Gets all active enemies
   * @returns Array of active enemies
   */
  public getActiveEnemies(): Enemy[] {
    return [...this.enemies];
  }

  /**
   * Checks if a wave is currently spawning
   * @returns True if spawning, false otherwise
   */
  public isWaveSpawning(): boolean {
    return this.isSpawning;
  }
}