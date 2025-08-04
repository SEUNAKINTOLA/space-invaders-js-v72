/**
 * @file WaveManager.ts
 * @description Manages the spawning and progression of enemy waves in the game.
 * Handles wave configuration, enemy spawning, and wave state management.
 */

// Types and interfaces
interface WaveConfig {
  enemyCount: number;
  enemyTypes: EnemyType[];
  spawnInterval: number;
  difficulty: number;
}

interface WaveState {
  currentWave: number;
  enemiesSpawned: number;
  enemiesRemaining: number;
  isActive: boolean;
  startTime: number;
}

enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank',
  BOSS = 'boss'
}

type WaveCompletionCallback = () => void;

/**
 * Manages enemy wave spawning and progression
 */
export class WaveManager {
  private static readonly BASE_SPAWN_INTERVAL = 1000; // ms
  private static readonly DIFFICULTY_MULTIPLIER = 1.2;
  
  private waveConfigs: Map<number, WaveConfig>;
  private state: WaveState;
  private onWaveComplete?: WaveCompletionCallback;
  private spawnTimer?: NodeJS.Timeout;

  /**
   * Creates a new WaveManager instance
   * @param initialWaveConfigs Optional initial wave configurations
   */
  constructor(initialWaveConfigs?: Map<number, WaveConfig>) {
    this.waveConfigs = initialWaveConfigs || new Map();
    this.state = {
      currentWave: 0,
      enemiesSpawned: 0,
      enemiesRemaining: 0,
      isActive: false,
      startTime: 0
    };
  }

  /**
   * Adds a wave configuration
   * @param waveNumber Wave number to configure
   * @param config Wave configuration
   * @throws Error if wave number already exists
   */
  public addWaveConfig(waveNumber: number, config: WaveConfig): void {
    if (this.waveConfigs.has(waveNumber)) {
      throw new Error(`Wave ${waveNumber} configuration already exists`);
    }
    this.waveConfigs.set(waveNumber, config);
  }

  /**
   * Starts the wave system
   * @param onWaveComplete Callback for wave completion
   * @throws Error if no wave configurations exist
   */
  public start(onWaveComplete?: WaveCompletionCallback): void {
    if (this.waveConfigs.size === 0) {
      throw new Error('No wave configurations found');
    }

    this.onWaveComplete = onWaveComplete;
    this.startNextWave();
  }

  /**
   * Stops the wave system
   */
  public stop(): void {
    this.clearSpawnTimer();
    this.state.isActive = false;
  }

  /**
   * Handles enemy defeat
   */
  public onEnemyDefeated(): void {
    if (!this.state.isActive) return;

    this.state.enemiesRemaining--;
    
    if (this.state.enemiesRemaining <= 0) {
      this.handleWaveCompletion();
    }
  }

  /**
   * Gets the current wave number
   */
  public getCurrentWave(): number {
    return this.state.currentWave;
  }

  /**
   * Gets the current wave progress
   */
  public getWaveProgress(): number {
    const config = this.waveConfigs.get(this.state.currentWave);
    if (!config) return 0;

    return (config.enemyCount - this.state.enemiesRemaining) / config.enemyCount;
  }

  /**
   * Starts the next wave
   * @throws Error if wave configuration is not found
   */
  private startNextWave(): void {
    const nextWave = this.state.currentWave + 1;
    const config = this.waveConfigs.get(nextWave);

    if (!config) {
      throw new Error(`Wave ${nextWave} configuration not found`);
    }

    this.state = {
      currentWave: nextWave,
      enemiesSpawned: 0,
      enemiesRemaining: config.enemyCount,
      isActive: true,
      startTime: Date.now()
    };

    this.startSpawning(config);
  }

  /**
   * Starts spawning enemies for the current wave
   */
  private startSpawning(config: WaveConfig): void {
    this.clearSpawnTimer();

    const spawnEnemy = () => {
      if (!this.state.isActive) return;

      if (this.state.enemiesSpawned < config.enemyCount) {
        this.spawnEnemy(config);
        this.state.enemiesSpawned++;
        
        this.spawnTimer = setTimeout(
          spawnEnemy, 
          config.spawnInterval * WaveManager.BASE_SPAWN_INTERVAL
        );
      }
    };

    spawnEnemy();
  }

  /**
   * Spawns a single enemy
   * @param config Wave configuration
   */
  private spawnEnemy(config: WaveConfig): void {
    // Implementation would depend on game engine/framework
    // This is a placeholder for the actual enemy spawning logic
    const enemyType = this.selectEnemyType(config.enemyTypes);
    console.log(`Spawning enemy of type: ${enemyType}`);
  }

  /**
   * Selects an enemy type from available types
   */
  private selectEnemyType(types: EnemyType[]): EnemyType {
    const index = Math.floor(Math.random() * types.length);
    return types[index];
  }

  /**
   * Handles wave completion
   */
  private handleWaveCompletion(): void {
    this.clearSpawnTimer();
    this.state.isActive = false;

    if (this.onWaveComplete) {
      this.onWaveComplete();
    }

    if (this.waveConfigs.has(this.state.currentWave + 1)) {
      this.startNextWave();
    }
  }

  /**
   * Clears the spawn timer
   */
  private clearSpawnTimer(): void {
    if (this.spawnTimer) {
      clearTimeout(this.spawnTimer);
      this.spawnTimer = undefined;
    }
  }
}