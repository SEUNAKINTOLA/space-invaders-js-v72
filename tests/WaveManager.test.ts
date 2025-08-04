/**
 * @file WaveManager.test.ts
 * @description Test suite for the Wave Management System
 * 
 * Tests cover:
 * - Wave initialization
 * - Enemy spawning mechanics
 * - Wave progression
 * - Difficulty scaling
 * - Resource management
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { WaveManager } from '../src/systems/WaveManager';
import { Enemy } from '../src/entities/Enemy';
import { GameState } from '../src/core/GameState';
import { Vector2 } from '../src/utils/Vector2';
import { EnemyType } from '../src/types/EnemyTypes';

// Mock implementations
jest.mock('../src/entities/Enemy');
jest.mock('../src/core/GameState');

describe('WaveManager', () => {
    let waveManager: WaveManager;
    let gameState: jest.Mocked<GameState>;

    // Test configuration
    const defaultConfig = {
        initialEnemyCount: 5,
        enemyCountIncrement: 2,
        spawnDelay: 1000,
        waveDelay: 5000
    };

    beforeEach(() => {
        // Reset mocks and create fresh instances for each test
        jest.clearAllMocks();
        gameState = new GameState() as jest.Mocked<GameState>;
        waveManager = new WaveManager(gameState, defaultConfig);
    });

    describe('Initialization', () => {
        test('should initialize with correct default values', () => {
            expect(waveManager.getCurrentWave()).toBe(0);
            expect(waveManager.isWaveActive()).toBeFalsy();
            expect(waveManager.getTotalEnemiesSpawned()).toBe(0);
        });

        test('should properly configure with custom settings', () => {
            const customConfig = { ...defaultConfig, initialEnemyCount: 10 };
            const customWaveManager = new WaveManager(gameState, customConfig);
            expect(customWaveManager).toBeDefined();
        });
    });

    describe('Wave Management', () => {
        test('should start new wave correctly', async () => {
            await waveManager.startWave();
            expect(waveManager.isWaveActive()).toBeTruthy();
            expect(waveManager.getCurrentWave()).toBe(1);
        });

        test('should calculate correct enemy count for waves', () => {
            const wave1Count = waveManager.calculateEnemyCount(1);
            const wave2Count = waveManager.calculateEnemyCount(2);
            
            expect(wave1Count).toBe(defaultConfig.initialEnemyCount);
            expect(wave2Count).toBe(
                defaultConfig.initialEnemyCount + defaultConfig.enemyCountIncrement
            );
        });

        test('should handle wave completion', async () => {
            await waveManager.startWave();
            await waveManager.completeWave();
            
            expect(waveManager.isWaveActive()).toBeFalsy();
            expect(waveManager.getCurrentWave()).toBe(1);
        });
    });

    describe('Enemy Spawning', () => {
        test('should spawn enemies with correct properties', async () => {
            const spawnPosition = new Vector2(100, 100);
            const enemy = await waveManager.spawnEnemy(EnemyType.BASIC, spawnPosition);

            expect(enemy).toBeDefined();
            expect(enemy.position).toEqual(spawnPosition);
            expect(enemy.type).toBe(EnemyType.BASIC);
        });

        test('should track spawned enemies correctly', async () => {
            await waveManager.startWave();
            const initialCount = waveManager.getTotalEnemiesSpawned();
            
            await waveManager.spawnEnemy(EnemyType.BASIC, new Vector2(0, 0));
            
            expect(waveManager.getTotalEnemiesSpawned()).toBe(initialCount + 1);
        });

        test('should handle spawn failures gracefully', async () => {
            // Simulate a spawn failure
            jest.spyOn(Enemy, 'create').mockRejectedValueOnce(new Error('Spawn failed'));

            await expect(
                waveManager.spawnEnemy(EnemyType.BASIC, new Vector2(0, 0))
            ).rejects.toThrow('Spawn failed');
        });
    });

    describe('Difficulty Scaling', () => {
        test('should increase difficulty with each wave', async () => {
            const wave1Difficulty = waveManager.calculateWaveDifficulty(1);
            const wave2Difficulty = waveManager.calculateWaveDifficulty(2);
            
            expect(wave2Difficulty).toBeGreaterThan(wave1Difficulty);
        });

        test('should apply correct enemy modifiers based on wave', () => {
            const wave1Modifiers = waveManager.getEnemyModifiers(1);
            const wave3Modifiers = waveManager.getEnemyModifiers(3);

            expect(wave3Modifiers.health).toBeGreaterThan(wave1Modifiers.health);
            expect(wave3Modifiers.speed).toBeGreaterThan(wave1Modifiers.speed);
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid wave numbers', () => {
            expect(() => waveManager.calculateEnemyCount(-1)).toThrow();
            expect(() => waveManager.calculateWaveDifficulty(0)).toThrow();
        });

        test('should handle concurrent wave starts', async () => {
            await waveManager.startWave();
            await expect(waveManager.startWave()).rejects.toThrow('Wave already in progress');
        });
    });
});