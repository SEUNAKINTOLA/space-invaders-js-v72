/**
 * @fileoverview Object Pool implementation for game performance optimization.
 * Provides a generic object pooling system to reduce garbage collection overhead
 * by reusing objects instead of creating/destroying them repeatedly.
 * 
 * @module ObjectPool
 */

/**
 * Interface for poolable objects that can be reset to their initial state
 */
export interface IPoolable {
    reset(): void;
}

/**
 * Factory function type definition for creating new pool objects
 */
export type PoolObjectFactory<T> = () => T;

/**
 * Configuration options for the ObjectPool
 */
export interface ObjectPoolConfig {
    /** Initial size of the pool */
    initialSize?: number;
    /** Maximum size the pool can grow to */
    maxSize?: number;
    /** Whether to automatically expand the pool when empty */
    autoExpand?: boolean;
}

/**
 * Generic object pool implementation for efficient object reuse
 * @template T The type of objects managed by the pool
 */
export class ObjectPool<T extends IPoolable> {
    private readonly pool: T[] = [];
    private readonly factory: PoolObjectFactory<T>;
    private readonly config: Required<ObjectPoolConfig>;
    
    // Default configuration values
    private static readonly DEFAULT_CONFIG: Required<ObjectPoolConfig> = {
        initialSize: 100,
        maxSize: 1000,
        autoExpand: true
    };

    /**
     * Creates a new ObjectPool instance
     * @param factory Factory function to create new objects
     * @param config Pool configuration options
     * @throws Error if invalid configuration is provided
     */
    constructor(factory: PoolObjectFactory<T>, config?: ObjectPoolConfig) {
        this.factory = factory;
        this.config = { ...ObjectPool.DEFAULT_CONFIG, ...config };

        this.validateConfig();
        this.initialize();
    }

    /**
     * Validates the pool configuration
     * @throws Error if configuration is invalid
     */
    private validateConfig(): void {
        if (this.config.initialSize < 0) {
            throw new Error('Initial size cannot be negative');
        }
        if (this.config.maxSize < this.config.initialSize) {
            throw new Error('Max size cannot be less than initial size');
        }
    }

    /**
     * Initializes the pool with the initial size of objects
     */
    private initialize(): void {
        for (let i = 0; i < this.config.initialSize; i++) {
            this.pool.push(this.factory());
        }
    }

    /**
     * Acquires an object from the pool
     * @returns A pooled object instance
     * @throws Error if pool is empty and cannot expand
     */
    public acquire(): T {
        if (this.pool.length === 0) {
            if (this.canExpand()) {
                return this.factory();
            }
            throw new Error('Object pool is empty and cannot expand');
        }
        
        const object = this.pool.pop();
        return object!;
    }

    /**
     * Returns an object to the pool
     * @param object The object to return to the pool
     * @throws Error if object is null or undefined
     */
    public release(object: T): void {
        if (!object) {
            throw new Error('Cannot release null or undefined object');
        }

        object.reset();
        
        if (this.pool.length < this.config.maxSize) {
            this.pool.push(object);
        }
    }

    /**
     * Checks if the pool can expand
     * @returns boolean indicating if pool can expand
     */
    private canExpand(): boolean {
        return this.config.autoExpand && this.pool.length < this.config.maxSize;
    }

    /**
     * Gets the current size of the pool
     * @returns Current number of available objects in the pool
     */
    public get size(): number {
        return this.pool.length;
    }

    /**
     * Clears all objects from the pool
     */
    public clear(): void {
        this.pool.length = 0;
    }

    /**
     * Resizes the pool to the specified size
     * @param newSize Desired new size of the pool
     * @throws Error if new size is invalid
     */
    public resize(newSize: number): void {
        if (newSize < 0) {
            throw new Error('New size cannot be negative');
        }

        if (newSize > this.config.maxSize) {
            throw new Error('New size cannot exceed maximum pool size');
        }

        while (this.pool.length > newSize) {
            this.pool.pop();
        }

        while (this.pool.length < newSize) {
            this.pool.push(this.factory());
        }
    }
}

/**
 * Creates a new ObjectPool instance with type inference
 * @param factory Factory function to create new objects
 * @param config Pool configuration options
 * @returns A new ObjectPool instance
 */
export function createObjectPool<T extends IPoolable>(
    factory: PoolObjectFactory<T>,
    config?: ObjectPoolConfig
): ObjectPool<T> {
    return new ObjectPool<T>(factory, config);
}