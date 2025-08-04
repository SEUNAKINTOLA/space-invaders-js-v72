/**
 * @file GameUI.ts
 * @description Implements core game user interface elements and layout management.
 * Provides a centralized UI container and handles basic layout functionality.
 * 
 * @module GameUI
 * @author AI Assistant
 * @version 1.0.0
 */

// =========================================================================
// Imports
// =========================================================================
import { EventEmitter } from 'events';

// =========================================================================
// Types & Interfaces
// =========================================================================
/**
 * Configuration options for GameUI initialization
 */
interface GameUIConfig {
  containerId?: string;
  width: number;
  height: number;
  theme?: UITheme;
}

/**
 * Theme configuration for UI styling
 */
interface UITheme {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

/**
 * Position coordinates for UI elements
 */
interface Position {
  x: number;
  y: number;
}

// =========================================================================
// Constants
// =========================================================================
const DEFAULT_CONFIG: GameUIConfig = {
  containerId: 'game-ui',
  width: 800,
  height: 600,
  theme: {
    backgroundColor: '#000000',
    textColor: '#ffffff',
    fontFamily: 'Arial, sans-serif'
  }
};

// =========================================================================
// Main Class
// =========================================================================
/**
 * GameUI class handles the main game interface container and layout management
 */
export class GameUI extends EventEmitter {
  private container: HTMLElement | null;
  private config: GameUIConfig;
  private elements: Map<string, HTMLElement>;
  private isInitialized: boolean;

  /**
   * Creates a new GameUI instance
   * @param config - Configuration options for the UI
   */
  constructor(config: Partial<GameUIConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.elements = new Map();
    this.isInitialized = false;
    this.container = null;
  }

  /**
   * Initializes the UI container and base elements
   * @throws Error if initialization fails
   */
  public initialize(): void {
    try {
      this.createContainer();
      this.setupBaseStyles();
      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      throw new Error(`Failed to initialize GameUI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Adds a new UI element to the container
   * @param id - Unique identifier for the element
   * @param element - HTML element to add
   * @param position - Position coordinates for the element
   * @throws Error if element with same ID already exists
   */
  public addElement(id: string, element: HTMLElement, position?: Position): void {
    if (!this.isInitialized) {
      throw new Error('GameUI must be initialized before adding elements');
    }

    if (this.elements.has(id)) {
      throw new Error(`Element with ID '${id}' already exists`);
    }

    try {
      if (position) {
        element.style.position = 'absolute';
        element.style.left = `${position.x}px`;
        element.style.top = `${position.y}px`;
      }

      this.elements.set(id, element);
      this.container?.appendChild(element);
      this.emit('elementAdded', { id, element });
    } catch (error) {
      throw new Error(`Failed to add element: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Removes a UI element from the container
   * @param id - ID of the element to remove
   * @returns boolean indicating if element was removed
   */
  public removeElement(id: string): boolean {
    const element = this.elements.get(id);
    if (element && this.container) {
      try {
        this.container.removeChild(element);
        this.elements.delete(id);
        this.emit('elementRemoved', { id });
        return true;
      } catch (error) {
        throw new Error(`Failed to remove element: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    return false;
  }

  /**
   * Updates the position of an existing UI element
   * @param id - ID of the element to update
   * @param position - New position coordinates
   * @throws Error if element doesn't exist
   */
  public updateElementPosition(id: string, position: Position): void {
    const element = this.elements.get(id);
    if (!element) {
      throw new Error(`Element with ID '${id}' not found`);
    }

    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;
    this.emit('elementMoved', { id, position });
  }

  // =========================================================================
  // Private Methods
  // =========================================================================
  /**
   * Creates the main UI container element
   * @private
   */
  private createContainer(): void {
    this.container = document.getElementById(this.config.containerId!);
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = this.config.containerId!;
      document.body.appendChild(this.container);
    }
  }

  /**
   * Sets up base styles for the UI container
   * @private
   */
  private setupBaseStyles(): void {
    if (!this.container) return;

    Object.assign(this.container.style, {
      width: `${this.config.width}px`,
      height: `${this.config.height}px`,
      backgroundColor: this.config.theme?.backgroundColor,
      color: this.config.theme?.textColor,
      fontFamily: this.config.theme?.fontFamily,
      position: 'relative',
      overflow: 'hidden'
    });
  }

  /**
   * Cleans up resources and removes event listeners
   */
  public dispose(): void {
    this.elements.clear();
    this.removeAllListeners();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.isInitialized = false;
  }
}

export default GameUI;