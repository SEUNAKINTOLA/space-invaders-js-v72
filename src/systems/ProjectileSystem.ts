/**
 * @file ProjectileSystem.ts
 * @description Manages projectile creation, movement, and lifecycle in the game.
 * Handles player shooting mechanics for both keyboard and touch inputs.
 */

import { Vector2 } from '../types/Vector2';
import { GameObject } from '../core/GameObject';
import { System } from '../core/System';
import { Pool } from '../utils/Pool';
import { EventEmitter } from '../core/EventEmitter';

// Configuration constants
const CONFIG = {
    MAX_PROJECTILES: 100,
    DEFAULT_SPEED: 500,
    CLEANUP_INTERVAL: 1000,
    MAX_LIFETIME: 5000, // milliseconds
} as const;

/**
 * Represents a projectile entity in the game
 */
interface Projectile extends GameObject {
    velocity: Vector2;
    damage: number;
    createdAt: number;
    isActive: boolean;
}

/**
 * Configuration options for projectile creation
 */
interface ProjectileOptions {
    position: Vector2;
    direction: Vector2;
    speed?: number;
    damage?: number;
}

/**
 * Manages the lifecycle and behavior of projectiles in the game
 */
export class ProjectileSystem implements System {
    private projectilePool: Pool<Projectile>;
    private activeProjectiles: Set<Projectile>;
    private events: EventEmitter;

    /**
     * Creates a new ProjectileSystem instance
     * @param events - Event emitter for system communication
     */
    constructor(events: EventEmitter) {
        this.projectilePool = new Pool<Projectile>(
            () => this.createProjectile(),
            CONFIG.MAX_PROJECTILES
        );
        this.activeProjectiles = new Set();
        this.events = events;

        this.setupEventListeners();
        this.startCleanupInterval();
    }

    /**
     * Updates all active projectiles
     * @param deltaTime - Time elapsed since last update in seconds
     */
    public update(deltaTime: number): void {
        try {
            this.activeProjectiles.forEach(projectile => {
                if (!projectile.isActive) return;

                // Update position based on velocity
                projectile.position.x += projectile.velocity.x * deltaTime;
                projectile.position.y += projectile.velocity.y * deltaTime;

                // Check if projectile should be destroyed
                if (this.shouldDestroyProjectile(projectile)) {
                    this.destroyProjectile(projectile);
                }

                // Emit position update event
                this.events.emit('projectileMove', projectile);
            });
        } catch (error) {
            console.error('Error updating projectiles:', error);
        }
    }

    /**
     * Spawns a new projectile with the given options
     * @param options - Configuration for the new projectile
     * @returns The created projectile or null if creation failed
     */
    public spawnProjectile(options: ProjectileOptions): Projectile | null {
        try {
            const projectile = this.projectilePool.acquire();
            if (!projectile) {
                console.warn('Projectile pool exhausted');
                return null;
            }

            // Initialize projectile properties
            projectile.position = { ...options.position };
            projectile.velocity = {
                x: options.direction.x * (options.speed || CONFIG.DEFAULT_SPEED),
                y: options.direction.y * (options.speed || CONFIG.DEFAULT_SPEED)
            };
            projectile.damage = options.damage || 1;
            projectile.createdAt = Date.now();
            projectile.isActive = true;

            this.activeProjectiles.add(projectile);
            this.events.emit('projectileSpawned', projectile);

            return projectile;
        } catch (error) {
            console.error('Error spawning projectile:', error);
            return null;
        }
    }

    /**
     * Cleans up and destroys a projectile
     * @param projectile - The projectile to destroy
     */
    private destroyProjectile(projectile: Projectile): void {
        try {
            projectile.isActive = false;
            this.activeProjectiles.delete(projectile);
            this.projectilePool.release(projectile);
            this.events.emit('projectileDestroyed', projectile);
        } catch (error) {
            console.error('Error destroying projectile:', error);
        }
    }

    /**
     * Creates a new projectile instance
     * @returns A new projectile object
     */
    private createProjectile(): Projectile {
        return {
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            damage: 1,
            createdAt: 0,
            isActive: false,
            id: crypto.randomUUID()
        };
    }

    /**
     * Determines if a projectile should be destroyed
     * @param projectile - The projectile to check
     * @returns Boolean indicating if the projectile should be destroyed
     */
    private shouldDestroyProjectile(projectile: Projectile): boolean {
        const age = Date.now() - projectile.createdAt;
        return age > CONFIG.MAX_LIFETIME;
    }

    /**
     * Sets up event listeners for the system
     */
    private setupEventListeners(): void {
        this.events.on('collision', (data: { projectileId: string }) => {
            const projectile = Array.from(this.activeProjectiles)
                .find(p => p.id === data.projectileId);
            if (projectile) {
                this.destroyProjectile(projectile);
            }
        });
    }

    /**
     * Starts the interval for cleaning up inactive projectiles
     */
    private startCleanupInterval(): void {
        setInterval(() => {
            this.activeProjectiles.forEach(projectile => {
                if (this.shouldDestroyProjectile(projectile)) {
                    this.destroyProjectile(projectile);
                }
            });
        }, CONFIG.CLEANUP_INTERVAL);
    }

    /**
     * Cleans up the system resources
     */
    public dispose(): void {
        this.activeProjectiles.clear();
        this.events.removeAllListeners();
    }
}