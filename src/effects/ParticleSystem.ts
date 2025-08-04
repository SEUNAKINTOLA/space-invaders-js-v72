/**
 * @file ParticleSystem.ts
 * @description A flexible and performant particle system for creating visual effects.
 * Manages particle creation, updates, and lifecycle management.
 * 
 * @module ParticleSystem
 * @author AI Assistant
 * @version 1.0.0
 */

// Types and interfaces
interface Vector2D {
    x: number;
    y: number;
}

interface ParticleConfig {
    position: Vector2D;
    velocity?: Vector2D;
    acceleration?: Vector2D;
    color?: string;
    size?: number;
    life?: number;
    opacity?: number;
}

interface ParticleEmitterConfig {
    rate: number;           // Particles per second
    maxParticles: number;   // Maximum particles allowed
    position: Vector2D;     // Emitter position
    spread: number;         // Emission angle spread in radians
    initialSpeed: number;   // Initial particle velocity
}

/**
 * Represents a single particle in the system
 */
class Particle {
    private position: Vector2D;
    private velocity: Vector2D;
    private acceleration: Vector2D;
    private color: string;
    private size: number;
    private life: number;
    private maxLife: number;
    private opacity: number;

    constructor(config: ParticleConfig) {
        this.position = { ...config.position };
        this.velocity = config.velocity || { x: 0, y: 0 };
        this.acceleration = config.acceleration || { x: 0, y: 0 };
        this.color = config.color || '#ffffff';
        this.size = config.size || 1;
        this.maxLife = config.life || 1000; // milliseconds
        this.life = this.maxLife;
        this.opacity = config.opacity || 1;
    }

    /**
     * Updates particle state based on delta time
     * @param deltaTime Time elapsed since last update in milliseconds
     * @returns boolean indicating if particle is still alive
     */
    update(deltaTime: number): boolean {
        this.life -= deltaTime;
        if (this.life <= 0) return false;

        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime / 1000;
        this.position.y += this.velocity.y * deltaTime / 1000;

        // Update velocity based on acceleration
        this.velocity.x += this.acceleration.x * deltaTime / 1000;
        this.velocity.y += this.acceleration.y * deltaTime / 1000;

        // Update opacity based on life
        this.opacity = this.life / this.maxLife;

        return true;
    }

    /**
     * Renders the particle to a canvas context
     */
    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * Main particle system manager class
 */
export class ParticleSystem {
    private particles: Particle[] = [];
    private emitterConfig: ParticleEmitterConfig;
    private lastEmitTime: number = 0;
    private active: boolean = false;

    constructor(config: ParticleEmitterConfig) {
        this.emitterConfig = { ...config };
    }

    /**
     * Starts the particle system
     */
    start(): void {
        this.active = true;
        this.lastEmitTime = performance.now();
    }

    /**
     * Stops particle emission but allows existing particles to complete
     */
    stop(): void {
        this.active = false;
    }

    /**
     * Updates all particles and handles emission of new particles
     * @param deltaTime Time elapsed since last update in milliseconds
     */
    update(deltaTime: number): void {
        const currentTime = performance.now();

        // Emit new particles if active
        if (this.active) {
            const emissionCount = this.calculateEmissionCount(currentTime);
            for (let i = 0; i < emissionCount; i++) {
                this.emitParticle();
            }
            this.lastEmitTime = currentTime;
        }

        // Update existing particles
        this.particles = this.particles.filter(particle => 
            particle.update(deltaTime));
    }

    /**
     * Renders all particles to the provided canvas context
     */
    render(ctx: CanvasRenderingContext2D): void {
        this.particles.forEach(particle => particle.render(ctx));
    }

    /**
     * Calculates how many particles should be emitted based on elapsed time
     */
    private calculateEmissionCount(currentTime: number): number {
        const elapsed = currentTime - this.lastEmitTime;
        const count = (this.emitterConfig.rate * elapsed) / 1000;
        
        if (this.particles.length >= this.emitterConfig.maxParticles) {
            return 0;
        }

        return Math.floor(Math.min(
            count,
            this.emitterConfig.maxParticles - this.particles.length
        ));
    }

    /**
     * Creates and emits a new particle
     */
    private emitParticle(): void {
        const angle = (Math.random() - 0.5) * this.emitterConfig.spread;
        const speed = this.emitterConfig.initialSpeed;

        const particle = new Particle({
            position: { ...this.emitterConfig.position },
            velocity: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            },
            acceleration: { x: 0, y: 98 }, // Default gravity
            color: this.getRandomColor(),
            size: Math.random() * 2 + 1,
            life: Math.random() * 1000 + 1000, // 1-2 seconds
            opacity: 1
        });

        this.particles.push(particle);
    }

    /**
     * Generates a random color for particles
     */
    private getRandomColor(): string {
        const hue = Math.random() * 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    /**
     * Returns the current particle count
     */
    get particleCount(): number {
        return this.particles.length;
    }

    /**
     * Clears all particles from the system
     */
    clear(): void {
        this.particles = [];
    }
}