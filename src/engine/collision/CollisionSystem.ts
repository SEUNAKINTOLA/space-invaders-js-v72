/**
 * @file CollisionSystem.ts
 * @description Implements AABB (Axis-Aligned Bounding Box) collision detection system for game entities.
 * Provides efficient collision detection and resolution mechanisms for 2D game objects.
 * 
 * @module engine/collision
 * @version 1.0.0
 */

// Types and interfaces
interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CollisionResult {
  hasCollision: boolean;
  overlap?: {
    x: number;
    y: number;
  };
}

/**
 * Represents a collision detection system using AABB algorithm
 */
export class CollisionSystem {
  private static instance: CollisionSystem;
  private readonly collisionGroups: Map<string, Set<BoundingBox>>;

  private constructor() {
    this.collisionGroups = new Map();
  }

  /**
   * Gets the singleton instance of the CollisionSystem
   * @returns {CollisionSystem} The collision system instance
   */
  public static getInstance(): CollisionSystem {
    if (!CollisionSystem.instance) {
      CollisionSystem.instance = new CollisionSystem();
    }
    return CollisionSystem.instance;
  }

  /**
   * Checks for collision between two bounding boxes
   * @param boxA First bounding box
   * @param boxB Second bounding box
   * @returns {CollisionResult} Collision result with overlap information
   * @throws {Error} If invalid bounding box parameters are provided
   */
  public checkCollision(boxA: BoundingBox, boxB: BoundingBox): CollisionResult {
    try {
      this.validateBoundingBox(boxA);
      this.validateBoundingBox(boxB);

      const collision = this.detectAABBCollision(boxA, boxB);
      
      if (!collision.hasCollision) {
        return { hasCollision: false };
      }

      return {
        hasCollision: true,
        overlap: collision.overlap
      };
    } catch (error) {
      console.error('Collision detection error:', error);
      throw error;
    }
  }

  /**
   * Adds a collision object to a specific group
   * @param groupId Group identifier
   * @param boundingBox Bounding box to add
   */
  public addToCollisionGroup(groupId: string, boundingBox: BoundingBox): void {
    if (!this.collisionGroups.has(groupId)) {
      this.collisionGroups.set(groupId, new Set());
    }
    this.collisionGroups.get(groupId)?.add(boundingBox);
  }

  /**
   * Removes a collision object from a specific group
   * @param groupId Group identifier
   * @param boundingBox Bounding box to remove
   * @returns {boolean} True if object was removed successfully
   */
  public removeFromCollisionGroup(groupId: string, boundingBox: BoundingBox): boolean {
    const group = this.collisionGroups.get(groupId);
    if (!group) return false;
    return group.delete(boundingBox);
  }

  /**
   * Checks collisions between two groups
   * @param groupA First group identifier
   * @param groupB Second group identifier
   * @returns {Array<[BoundingBox, BoundingBox]>} Array of colliding pairs
   */
  public checkGroupCollisions(
    groupA: string,
    groupB: string
  ): Array<[BoundingBox, BoundingBox]> {
    const groupAObjects = this.collisionGroups.get(groupA);
    const groupBObjects = this.collisionGroups.get(groupB);

    if (!groupAObjects || !groupBObjects) {
      return [];
    }

    const collisions: Array<[BoundingBox, BoundingBox]> = [];

    groupAObjects.forEach(boxA => {
      groupBObjects.forEach(boxB => {
        if (this.checkCollision(boxA, boxB).hasCollision) {
          collisions.push([boxA, boxB]);
        }
      });
    });

    return collisions;
  }

  /**
   * Validates a bounding box object
   * @param box Bounding box to validate
   * @throws {Error} If the bounding box is invalid
   */
  private validateBoundingBox(box: BoundingBox): void {
    if (!box || typeof box.x !== 'number' || typeof box.y !== 'number' ||
        typeof box.width !== 'number' || typeof box.height !== 'number') {
      throw new Error('Invalid bounding box parameters');
    }

    if (box.width < 0 || box.height < 0) {
      throw new Error('Bounding box dimensions cannot be negative');
    }
  }

  /**
   * Performs AABB collision detection between two boxes
   * @param boxA First bounding box
   * @param boxB Second bounding box
   * @returns {CollisionResult} Collision result with overlap information
   */
  private detectAABBCollision(boxA: BoundingBox, boxB: BoundingBox): CollisionResult {
    const xOverlap = Math.min(
      boxA.x + boxA.width - boxB.x,
      boxB.x + boxB.width - boxA.x
    );

    const yOverlap = Math.min(
      boxA.y + boxA.height - boxB.y,
      boxB.y + boxB.height - boxA.y
    );

    if (xOverlap > 0 && yOverlap > 0) {
      return {
        hasCollision: true,
        overlap: {
          x: xOverlap,
          y: yOverlap
        }
      };
    }

    return { hasCollision: false };
  }

  /**
   * Clears all collision groups
   */
  public clearCollisionGroups(): void {
    this.collisionGroups.clear();
  }
}

export default CollisionSystem;