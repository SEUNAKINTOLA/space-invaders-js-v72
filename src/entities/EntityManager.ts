import { Entity } from './Entity';
import { Vector2D } from '../types/Vector2D';
import { QuadTree } from '../utils/QuadTree';
import { ObjectPool } from '../utils/ObjectPool';
import { Performance } from '../utils/Performance';

/**
 * Manages game entities with optimized performance for updates and rendering
 * Implements spatial partitioning, object pooling, and batch processing
 */
export class EntityManager {
    private entities: Map<string, Entity>;
    private quadTree: QuadTree;
    private objectPool: ObjectPool<Entity>;
    private spatialBounds: { width: number; height: number };
    private performanceMonitor: Performance;
    
    // Batch processing arrays
    private updateQueue: Entity[] = [];
    private renderQueue: Entity[] = [];
    
    // Frame timing
    private readonly TARGET_FRAME_TIME = 16; // ~60 FPS
    private lastFrameTime: number = 0;

    constructor(width: number, height: number, maxEntities: number = 1000) {
        this.entities = new Map<string, Entity>();
        this.spatialBounds = { width, height };
        this.quadTree = new QuadTree({
            x: 0,
            y: 0,
            width,
            height
        });
        this.objectPool = new ObjectPool<Entity>(maxEntities);
        this.performanceMonitor = new Performance();
    }

    /**
     * Adds an entity to the management system
     * @param entity The entity to add
     * @throws Error if entity ID already exists
     */
    public addEntity(entity: Entity): void {
        try {
            if (this.entities.has(entity.id)) {
                throw new Error(`Entity with ID ${entity.id} already exists`);
            }
            
            this.entities.set(entity.id, entity);
            this.quadTree.insert({
                id: entity.id,
                x: entity.position.x,
                y: entity.position.y,
                width: entity.bounds.width,
                height: entity.bounds.height
            });
        } catch (error) {
            console.error('Failed to add entity:', error);
            throw error;
        }
    }

    /**
     * Updates all entities with optimized batch processing
     * @param deltaTime Time elapsed since last update
     */
    public update(deltaTime: number): void {
        const currentTime = performance.now();
        this.performanceMonitor.startMeasure('update');

        // Clear previous frame's queues
        this.updateQueue = [];
        this.quadTree.clear();

        // Batch entities for update
        for (const entity of this.entities.values()) {
            if (entity.isActive) {
                this.updateQueue.push(entity);
                this.quadTree.insert({
                    id: entity.id,
                    x: entity.position.x,
                    y: entity.position.y,
                    width: entity.bounds.width,
                    height: entity.bounds.height
                });
            }
        }

        // Process updates in batches
        const batchSize = 100;
        for (let i = 0; i < this.updateQueue.length; i += batchSize) {
            const batch = this.updateQueue.slice(i, i + batchSize);
            this.processBatch(batch, deltaTime);
        }

        this.performanceMonitor.endMeasure('update');
        this.lastFrameTime = performance.now() - currentTime;
    }

    /**
     * Renders entities with visibility culling and batching
     * @param context The rendering context
     */
    public render(context: CanvasRenderingContext2D): void {
        this.performanceMonitor.startMeasure('render');

        // Get visible area bounds
        const viewBounds = {
            x: 0,
            y: 0,
            width: context.canvas.width,
            height: context.canvas.height
        };

        // Query only visible entities
        this.renderQueue = this.quadTree.query(viewBounds)
            .map(item => this.entities.get(item.id))
            .filter(entity => entity && entity.isVisible) as Entity[];

        // Sort by z-index for correct rendering order
        this.renderQueue.sort((a, b) => a.zIndex - b.zIndex);

        // Batch render entities
        for (const entity of this.renderQueue) {
            try {
                entity.render(context);
            } catch (error) {
                console.warn(`Failed to render entity ${entity.id}:`, error);
            }
        }

        this.performanceMonitor.endMeasure('render');
    }

    /**
     * Process a batch of entities
     * @param batch Array of entities to process
     * @param deltaTime Time elapsed since last update
     */
    private processBatch(batch: Entity[], deltaTime: number): void {
        for (const entity of batch) {
            try {
                if (this.lastFrameTime <= this.TARGET_FRAME_TIME) {
                    // Full update if frame time is good
                    entity.update(deltaTime);
                } else {
                    // Simplified update if we're dropping frames
                    entity.simplifiedUpdate(deltaTime);
                }
            } catch (error) {
                console.warn(`Failed to update entity ${entity.id}:`, error);
            }
        }
    }

    /**
     * Removes an entity from the management system
     * @param entityId ID of the entity to remove
     */
    public removeEntity(entityId: string): void {
        const entity = this.entities.get(entityId);
        if (entity) {
            this.entities.delete(entityId);
            this.objectPool.release(entity);
        }
    }

    /**
     * Gets nearby entities within a radius
     * @param position Center position to check
     * @param radius Radius to check for entities
     * @returns Array of entities within the radius
     */
    public getNearbyEntities(position: Vector2D, radius: number): Entity[] {
        const bounds = {
            x: position.x - radius,
            y: position.y - radius,
            width: radius * 2,
            height: radius * 2
        };

        return this.quadTree.query(bounds)
            .map(item => this.entities.get(item.id))
            .filter(entity => entity !== undefined) as Entity[];
    }

    /**
     * Gets performance metrics
     * @returns Object containing performance metrics
     */
    public getPerformanceMetrics() {
        return {
            entityCount: this.entities.size,
            updateTime: this.performanceMonitor.getMeasure('update'),
            renderTime: this.performanceMonitor.getMeasure('render'),
            frameTime: this.lastFrameTime
        };
    }
}