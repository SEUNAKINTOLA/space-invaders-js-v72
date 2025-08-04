/**
 * @file Quadtree.ts
 * @description Quadtree implementation for efficient spatial partitioning and collision detection.
 * Provides O(log n) performance for spatial queries in a 2D space.
 */

/**
 * Represents a 2D boundary rectangle used by the Quadtree
 */
interface Boundary {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Represents an object that can be stored in the Quadtree
 */
interface QuadtreeObject {
    x: number;
    y: number;
    width: number;
    height: number;
    id?: string | number;
}

/**
 * Configuration constants for Quadtree
 */
const QUADTREE_CONFIG = {
    MAX_OBJECTS: 10,    // Maximum objects a node can hold before splitting
    MAX_LEVELS: 5,      // Maximum levels of subdivision
    MIN_SIZE: 16        // Minimum node size in pixels
} as const;

/**
 * Quadtree class for spatial partitioning and efficient collision detection
 */
export class Quadtree {
    private boundary: Boundary;
    private objects: QuadtreeObject[];
    private nodes: Quadtree[];
    private level: number;

    /**
     * Creates a new Quadtree instance
     * @param boundary - The boundary rectangle for this quadtree node
     * @param level - The current level of subdivision (0 for root)
     */
    constructor(boundary: Boundary, level: number = 0) {
        if (!this.isValidBoundary(boundary)) {
            throw new Error('Invalid boundary provided to Quadtree');
        }

        this.boundary = boundary;
        this.level = level;
        this.objects = [];
        this.nodes = [];
    }

    /**
     * Validates boundary parameters
     */
    private isValidBoundary(boundary: Boundary): boolean {
        return (
            boundary.width > 0 &&
            boundary.height > 0 &&
            Number.isFinite(boundary.x) &&
            Number.isFinite(boundary.y)
        );
    }

    /**
     * Clears the quadtree
     */
    public clear(): void {
        this.objects = [];

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i]) {
                this.nodes[i].clear();
            }
        }

        this.nodes = [];
    }

    /**
     * Splits the node into four subnodes
     */
    private split(): void {
        const subWidth = this.boundary.width / 2;
        const subHeight = this.boundary.height / 2;
        const x = this.boundary.x;
        const y = this.boundary.y;

        // Don't split if resulting nodes would be too small
        if (subWidth < QUADTREE_CONFIG.MIN_SIZE || subHeight < QUADTREE_CONFIG.MIN_SIZE) {
            return;
        }

        this.nodes[0] = new Quadtree(
            { x: x + subWidth, y: y, width: subWidth, height: subHeight },
            this.level + 1
        );

        this.nodes[1] = new Quadtree(
            { x: x, y: y, width: subWidth, height: subHeight },
            this.level + 1
        );

        this.nodes[2] = new Quadtree(
            { x: x, y: y + subHeight, width: subWidth, height: subHeight },
            this.level + 1
        );

        this.nodes[3] = new Quadtree(
            { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
            this.level + 1
        );
    }

    /**
     * Determines which node an object belongs to
     * @param object - The object to check
     * @returns Array of indexes of the nodes the object belongs to
     */
    private getIndices(object: QuadtreeObject): number[] {
        const indices: number[] = [];
        const verticalMidpoint = this.boundary.x + (this.boundary.width / 2);
        const horizontalMidpoint = this.boundary.y + (this.boundary.height / 2);

        const topQuadrant = object.y < horizontalMidpoint && 
                           object.y + object.height < horizontalMidpoint;
        const bottomQuadrant = object.y > horizontalMidpoint;

        if (object.x < verticalMidpoint && object.x + object.width < verticalMidpoint) {
            if (topQuadrant) indices.push(1);
            if (bottomQuadrant) indices.push(2);
        }

        if (object.x > verticalMidpoint) {
            if (topQuadrant) indices.push(0);
            if (bottomQuadrant) indices.push(3);
        }

        return indices;
    }

    /**
     * Inserts an object into the quadtree
     * @param object - The object to insert
     */
    public insert(object: QuadtreeObject): void {
        if (!this.boundary) {
            throw new Error('Quadtree boundary not set');
        }

        if (this.nodes.length) {
            const indices = this.getIndices(object);

            for (const index of indices) {
                this.nodes[index].insert(object);
            }
            return;
        }

        this.objects.push(object);

        if (this.objects.length > QUADTREE_CONFIG.MAX_OBJECTS && 
            this.level < QUADTREE_CONFIG.MAX_LEVELS) {
            if (this.nodes.length === 0) {
                this.split();
            }

            let i = 0;
            while (i < this.objects.length) {
                const indices = this.getIndices(this.objects[i]);
                if (indices.length > 0) {
                    for (const index of indices) {
                        this.nodes[index].insert(this.objects[i]);
                    }
                    this.objects.splice(i, 1);
                } else {
                    i++;
                }
            }
        }
    }

    /**
     * Returns all objects that could collide with the given object
     * @param object - The object to check for potential collisions
     * @returns Array of objects that might collide with the given object
     */
    public retrieve(object: QuadtreeObject): QuadtreeObject[] {
        const indices = this.getIndices(object);
        let returnObjects = this.objects;

        if (this.nodes.length) {
            for (const index of indices) {
                returnObjects = returnObjects.concat(this.nodes[index].retrieve(object));
            }
        }

        return returnObjects;
    }

    /**
     * Checks if two objects are colliding using AABB collision detection
     * @param objA - First object
     * @param objB - Second object
     * @returns Boolean indicating whether the objects are colliding
     */
    public static checkCollision(objA: QuadtreeObject, objB: QuadtreeObject): boolean {
        return !(
            objA.x + objA.width < objB.x ||
            objA.x > objB.x + objB.width ||
            objA.y + objA.height < objB.y ||
            objA.y > objB.y + objB.height
        );
    }
}