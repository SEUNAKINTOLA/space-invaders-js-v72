/**
 * @file GameEffects.ts
 * @description Manages and triggers visual effects for game events.
 * Provides a centralized system for handling particle effects, animations,
 * and other visual feedback in the game.
 */

// Type definitions
interface EffectConfig {
  duration: number;
  intensity: number;
  color?: string;
  scale?: number;
  particleCount?: number;
}

interface EffectPosition {
  x: number;
  y: number;
  z?: number;
}

type EffectType = 
  | 'explosion'
  | 'sparkle'
  | 'smoke'
  | 'flash'
  | 'fadeIn'
  | 'fadeOut';

// Effect preset configurations
const EFFECT_PRESETS: Record<string, EffectConfig> = {
  smallExplosion: {
    duration: 500,
    intensity: 0.5,
    particleCount: 10,
    scale: 1,
    color: '#FF4400'
  },
  largeExplosion: {
    duration: 1000,
    intensity: 1,
    particleCount: 30,
    scale: 2,
    color: '#FF6600'
  },
  sparkle: {
    duration: 300,
    intensity: 0.3,
    particleCount: 5,
    scale: 0.5,
    color: '#FFFF00'
  }
};

/**
 * Class responsible for managing and triggering game visual effects
 */
export class GameEffects {
  private static instance: GameEffects;
  private activeEffects: Map<string, any>;
  private effectSystem: any; // Replace with actual effect system type

  private constructor() {
    this.activeEffects = new Map();
    this.effectSystem = {}; // Initialize your effect system here
  }

  /**
   * Gets the singleton instance of GameEffects
   */
  public static getInstance(): GameEffects {
    if (!GameEffects.instance) {
      GameEffects.instance = new GameEffects();
    }
    return GameEffects.instance;
  }

  /**
   * Triggers a visual effect at the specified position
   * @param effectType - Type of effect to trigger
   * @param position - Position where the effect should appear
   * @param config - Optional custom configuration for the effect
   * @returns Promise that resolves when the effect completes
   */
  public async triggerEffect(
    effectType: EffectType,
    position: EffectPosition,
    config?: Partial<EffectConfig>
  ): Promise<void> {
    try {
      const effectConfig = this.getEffectConfig(effectType, config);
      const effectId = this.generateEffectId();

      await this.validateEffectParameters(effectType, position, effectConfig);
      
      const effect = await this.createEffect(effectId, effectType, position, effectConfig);
      this.activeEffects.set(effectId, effect);

      // Set up effect completion handling
      return new Promise((resolve) => {
        setTimeout(() => {
          this.cleanupEffect(effectId);
          resolve();
        }, effectConfig.duration);
      });
    } catch (error) {
      console.error(`Failed to trigger effect ${effectType}:`, error);
      throw new Error(`Effect creation failed: ${error.message}`);
    }
  }

  /**
   * Stops all active effects
   */
  public stopAllEffects(): void {
    try {
      this.activeEffects.forEach((effect, effectId) => {
        this.cleanupEffect(effectId);
      });
      this.activeEffects.clear();
    } catch (error) {
      console.error('Failed to stop all effects:', error);
    }
  }

  /**
   * Creates a preset effect with predefined configuration
   * @param presetName - Name of the preset effect
   * @param position - Position where the effect should appear
   */
  public async createPresetEffect(
    presetName: string,
    position: EffectPosition
  ): Promise<void> {
    const preset = EFFECT_PRESETS[presetName];
    if (!preset) {
      throw new Error(`Preset effect "${presetName}" not found`);
    }

    return this.triggerEffect('explosion', position, preset);
  }

  // Private helper methods

  private async validateEffectParameters(
    effectType: EffectType,
    position: EffectPosition,
    config: EffectConfig
  ): Promise<void> {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      throw new Error('Invalid effect position');
    }

    if (config.duration <= 0 || config.intensity <= 0) {
      throw new Error('Invalid effect configuration');
    }
  }

  private getEffectConfig(
    effectType: EffectType,
    customConfig?: Partial<EffectConfig>
  ): EffectConfig {
    const defaultConfig: EffectConfig = {
      duration: 500,
      intensity: 1,
      scale: 1,
      particleCount: 10
    };

    return { ...defaultConfig, ...customConfig };
  }

  private generateEffectId(): string {
    return `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async createEffect(
    effectId: string,
    effectType: EffectType,
    position: EffectPosition,
    config: EffectConfig
  ): Promise<any> {
    // Implementation would depend on your actual effect system
    return {
      id: effectId,
      type: effectType,
      position,
      config,
      startTime: Date.now()
    };
  }

  private cleanupEffect(effectId: string): void {
    const effect = this.activeEffects.get(effectId);
    if (effect) {
      // Cleanup implementation would depend on your effect system
      this.activeEffects.delete(effectId);
    }
  }
}

// Export a default instance
export default GameEffects.getInstance();