/**
 * @file ProjectileManager.ts
 * @description Manages projectile pooling and lifecycle for enemy attack systems.
 * Implements object pooling pattern for performance optimization.
 */

import { Vector2 } from '../types/Vector2';
import { GameObject } from '../core/GameObject';
import { ObjectPool } from '../utils/ObjectPool';
import { EventEmitter } from '../core/EventEmitter';

// Configuration constants
const DEFAULT_POOL_SIZE = 50;
const MAX_PROJECTILES = 200;
const CLEANUP_INTERVAL = 1000; // milliseconds

/**
 * Represents a single projectile instance
 */
export interface Projectile extends GameObject {
    id: string;
    position: Vector2;
    velocity: Vector2;
    damage: number;
    isActive: boolean;
    lifespan: number;
    spawnTime: number;
    
    reset(): void;
    update(deltaTime: number): void;
}

/**
 * Configuration options for ProjectileManager
 */
export interface ProjectileManagerConfig {
    initialPoolSize?: number;
    maxProjectiles?: number;
    defaultDamage?: number;
    defaultLifespan?: number;
}

/**
 * Manages the creation, pooling, and lifecycle of enemy projectiles
 */
export class ProjectileManager {
    private projectilePool: ObjectPool<Projectile>;
    private activeProjectiles: Set<Projectile>;
    private config: Required<ProjectileManagerConfig>;
    private events: EventEmitter;

    constructor(config: ProjectileManagerConfig = {}) {
        this.config = {
            initialPoolSize: config.initialPoolSize || DEFAULT_POOL_SIZE,
            maxProjectiles: config.maxProjectiles || MAX_PROJECTILES,
            defaultDamage: config.defaultDamage || 10,
            defaultLifespan: config.defaultLifespan || 5000
        };

        this.activeProjectiles = new Set();
        this.events = new EventEmitter();
        
        this.initializePool();
        this.startCleanupInterval();
    }

    /**
     * Initializes the projectile pool
     * @private
     */
    private initializePool(): void {
        try {
            this.projectilePool = new ObjectPool<Projectile>({
                create: () => this.createProjectile(),
                reset: (projectile) => projectile.reset(),
                initialSize: this.config.initialPoolSize
            });
        } catch (error) {
            console.error('Failed to initialize projectile pool:', error);
            throw new Error('ProjectileManager initialization failed');
        }
    }

    /**
     * Creates a new projectile instance
     * @private
     * @returns {Projectile} New projectile instance
     */
    private createProjectile(): Projectile {
        return {
            id: crypto.randomUUID(),
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            damage: this.config.defaultDamage,
            isActive: false,
            lifespan: this.config.defaultLifespan,
            spawnTime: 0,
            
            reset(): void {
                this.isActive = false;
                this.position = { x: 0, y: 0 };
                this.velocity = { x: 0, y: 0 };
                this.spawnTime = 0;
            },
            
            update(deltaTime: number): void {
                if (!this.isActive) return;
                
                this.position.x += this.velocity.x * deltaTime;
                this.position.y += this.velocity.y * deltaTime;
            }
        };
    }

    /**
     * Spawns a new projectile
     * @param {Vector2} position Initial position
     * @param {Vector2} velocity Initial velocity
     * @param {number} [damage] Optional damage override
     * @returns {Projectile | null} Spawned projectile or null if pool is exhausted
     */
    public spawnProjectile(
        position: Vector2,
        velocity: Vector2,
        damage?: number
    ): Projectile | null {
        try {
            if (this.activeProjectiles.size >= this.config.maxProjectiles) {
                console.warn('Maximum projectile limit reached');
                return null;
            }

            const projectile = this.projectilePool.acquire();
            if (!projectile) return null;

            projectile.position = { ...position };
            projectile.velocity = { ...velocity };
            projectile.damage = damage ?? this.config.defaultDamage;
            projectile.isActive = true;
            projectile.spawnTime = Date.now();

            this.activeProjectiles.add(projectile);
            this.events.emit('projectileSpawned', projectile);

            return projectile;
        } catch (error) {
            console.error('Failed to spawn projectile:', error);
            return null;
        }
    }

    /**
     * Updates all active projectiles
     * @param {number} deltaTime Time since last update in milliseconds
     */
    public update(deltaTime: number): void {
        for (const projectile of this.activeProjectiles) {
            projectile.update(deltaTime);
            
            // Check if projectile should be destroyed
            if (this.shouldDestroyProjectile(projectile)) {
                this.destroyProjectile(projectile);
            }
        }
    }

    /**
     * Determines if a projectile should be destroyed
     * @private
     * @param {Projectile} projectile Projectile to check
     * @returns {boolean} True if projectile should be destroyed
     */
    private shouldDestroyProjectile(projectile: Projectile): boolean {
        const age = Date.now() - projectile.spawnTime;
        return age >= projectile.lifespan;
    }

    /**
     * Destroys a projectile and returns it to the pool
     * @param {Projectile} projectile Projectile to destroy
     */
    public destroyProjectile(projectile: Projectile): void {
        try {
            this.activeProjectiles.delete(projectile);
            this.projectilePool.release(projectile);
            this.events.emit('projectileDestroyed', projectile);
        } catch (error) {
            console.error('Failed to destroy projectile:', error);
        }
    }

    /**
     * Starts the automatic cleanup interval
     * @private
     */
    private startCleanupInterval(): void {
        setInterval(() => {
            const now = Date.now();
            for (const projectile of this.activeProjectiles) {
                if (now - projectile.spawnTime >= projectile.lifespan) {
                    this.destroyProjectile(projectile);
                }
            }
        }, CLEANUP_INTERVAL);
    }

    /**
     * Cleans up all projectiles and resources
     */
    public dispose(): void {
        this.activeProjectiles.clear();
        this.events.removeAllListeners();
    }

    /**
     * Returns the current count of active projectiles
     * @returns {number} Active projectile count
     */
    public getActiveProjectileCount(): number {
        return this.activeProjectiles.size;
    }

    /**
     * Subscribes to projectile events
     * @param {string} event Event name
     * @param {Function} callback Callback function
     */
    public on(event: string, callback: Function): void {
        this.events.on(event, callback);
    }
}