/**
 * @file EnemyMovement.test.ts
 * @description Integration tests for enemy movement mechanics and behaviors
 * @module tests/EnemyMovement
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Enemy } from '../src/entities/Enemy';
import { Vector2D } from '../src/types/Vector2D';
import { MovementSystem } from '../src/systems/MovementSystem';
import { GameWorld } from '../src/core/GameWorld';
import { CollisionSystem } from '../src/systems/CollisionSystem';

// Test configuration
const TEST_CONFIG = {
  defaultSpeed: 5,
  updateInterval: 16, // ~60fps
  worldBounds: {
    width: 1000,
    height: 1000
  }
};

describe('Enemy Movement Integration Tests', () => {
  let enemy: Enemy;
  let movementSystem: MovementSystem;
  let gameWorld: GameWorld;
  let collisionSystem: CollisionSystem;

  beforeEach(() => {
    // Reset mocks and create fresh instances for each test
    jest.clearAllMocks();
    
    gameWorld = new GameWorld(TEST_CONFIG.worldBounds);
    collisionSystem = new CollisionSystem(gameWorld);
    movementSystem = new MovementSystem(gameWorld, collisionSystem);
    
    enemy = new Enemy({
      position: { x: 500, y: 500 },
      speed: TEST_CONFIG.defaultSpeed,
      size: { width: 32, height: 32 }
    });
  });

  describe('Basic Movement', () => {
    test('should move enemy in specified direction', () => {
      const initialPosition = { ...enemy.position };
      const direction: Vector2D = { x: 1, y: 0 }; // Move right
      
      movementSystem.moveEntity(enemy, direction);
      
      expect(enemy.position.x).toBeGreaterThan(initialPosition.x);
      expect(enemy.position.y).toBe(initialPosition.y);
    });

    test('should respect movement speed', () => {
      const initialPosition = { ...enemy.position };
      const direction: Vector2D = { x: 1, y: 0 };
      
      movementSystem.moveEntity(enemy, direction);
      
      const expectedX = initialPosition.x + (enemy.speed * TEST_CONFIG.updateInterval / 1000);
      expect(enemy.position.x).toBeCloseTo(expectedX, 2);
    });
  });

  describe('Collision Handling', () => {
    test('should stop movement when colliding with world bounds', () => {
      enemy.position = { x: TEST_CONFIG.worldBounds.width - 1, y: 500 };
      const direction: Vector2D = { x: 1, y: 0 }; // Try to move right
      
      movementSystem.moveEntity(enemy, direction);
      
      expect(enemy.position.x).toBeLessThanOrEqual(TEST_CONFIG.worldBounds.width);
    });

    test('should handle collision with other entities', () => {
      const obstacle = new Enemy({
        position: { x: 532, y: 500 }, // Just to the right of the test enemy
        speed: 0,
        size: { width: 32, height: 32 }
      });
      
      gameWorld.addEntity(obstacle);
      const direction: Vector2D = { x: 1, y: 0 };
      
      movementSystem.moveEntity(enemy, direction);
      
      expect(enemy.position.x).toBeLessThan(obstacle.position.x - enemy.size.width);
    });
  });

  describe('Path Following', () => {
    test('should follow designated path points', () => {
      const pathPoints: Vector2D[] = [
        { x: 550, y: 500 },
        { x: 550, y: 550 },
        { x: 500, y: 550 }
      ];
      
      enemy.setPatrolPath(pathPoints);
      
      // Simulate multiple update cycles
      for (let i = 0; i < 10; i++) {
        movementSystem.updateEntityPath(enemy);
      }
      
      expect(enemy.currentPathIndex).toBeGreaterThan(0);
      expect(enemy.position).not.toEqual({ x: 500, y: 500 });
    });

    test('should complete path cycle and reset', () => {
      const pathPoints: Vector2D[] = [
        { x: 510, y: 500 }, // Short path for quick testing
      ];
      
      enemy.setPatrolPath(pathPoints);
      
      // Simulate until path completion
      for (let i = 0; i < 20; i++) {
        movementSystem.updateEntityPath(enemy);
      }
      
      expect(enemy.currentPathIndex).toBe(0);
      expect(enemy.position).toBeCloseTo(pathPoints[0], 2);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle rapid direction changes', () => {
      const directions: Vector2D[] = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 }
      ];
      
      directions.forEach(direction => {
        movementSystem.moveEntity(enemy, direction);
      });
      
      expect(enemy.position).toBeDefined();
    });

    test('should handle zero movement vector', () => {
      const initialPosition = { ...enemy.position };
      const direction: Vector2D = { x: 0, y: 0 };
      
      movementSystem.moveEntity(enemy, direction);
      
      expect(enemy.position).toEqual(initialPosition);
    });
  });
});