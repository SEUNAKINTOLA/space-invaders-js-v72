/**
 * @fileoverview Lazy Loading Implementation using Intersection Observer
 * Provides utilities for efficiently lazy loading images and other content
 * to improve initial page load performance.
 * 
 * @module lazy-loading
 * @author AI Assistant
 * @version 1.0.0
 */

// Configuration constants
const CONFIG = {
  rootMargin: '50px 0px', // Load items 50px before they enter viewport
  threshold: 0.1, // Start loading when 10% of element is visible
  defaultPlaceholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  loadingClass: 'is-loading',
  loadedClass: 'is-loaded',
  errorClass: 'has-error'
};

/**
 * Class to manage lazy loading of elements using Intersection Observer
 */
class LazyLoader {
  /**
   * Creates a new LazyLoader instance
   * @param {Object} options - Configuration options
   * @param {string} [options.rootMargin] - Root margin for intersection observer
   * @param {number} [options.threshold] - Intersection threshold
   * @param {string} [options.selector] - CSS selector for lazy load elements
   */
  constructor(options = {}) {
    this.options = { ...CONFIG, ...options };
    this.observer = null;
    this.initialized = false;

    // Bind methods
    this.handleIntersection = this.handleIntersection.bind(this);
    this.loadElement = this.loadElement.bind(this);
  }

  /**
   * Initializes the lazy loader
   * @throws {Error} If Intersection Observer is not supported
   */
  init() {
    if (this.initialized) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      throw new Error('Intersection Observer is not supported in this browser');
    }

    this.observer = new IntersectionObserver(this.handleIntersection, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });

    this.initialized = true;
    this.observeElements();
  }

  /**
   * Handles intersection observer callbacks
   * @param {IntersectionObserverEntry[]} entries - Intersection entries
   * @private
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  /**
   * Loads a lazy element
   * @param {HTMLElement} element - Element to load
   * @private
   */
  async loadElement(element) {
    try {
      element.classList.add(this.options.loadingClass);

      if (element.tagName.toLowerCase() === 'img') {
        await this.loadImage(element);
      } else {
        await this.loadContent(element);
      }

      element.classList.remove(this.options.loadingClass);
      element.classList.add(this.options.loadedClass);
      
      // Dispatch custom event
      element.dispatchEvent(new CustomEvent('lazyloaded'));
    } catch (error) {
      this.handleError(element, error);
    }
  }

  /**
   * Loads an image element
   * @param {HTMLImageElement} img - Image element to load
   * @returns {Promise} Promise that resolves when image is loaded
   * @private
   */
  loadImage(img) {
    return new Promise((resolve, reject) => {
      const src = img.dataset.src;
      if (!src) {
        reject(new Error('No data-src attribute found'));
        return;
      }

      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
      
      // Clean up data attributes
      delete img.dataset.src;
    });
  }

  /**
   * Loads content for non-image elements
   * @param {HTMLElement} element - Element to load content for
   * @returns {Promise} Promise that resolves when content is loaded
   * @private
   */
  loadContent(element) {
    return new Promise((resolve, reject) => {
      const content = element.dataset.content;
      if (!content) {
        reject(new Error('No data-content attribute found'));
        return;
      }

      element.innerHTML = content;
      delete element.dataset.content;
      resolve();
    });
  }

  /**
   * Handles loading errors
   * @param {HTMLElement} element - Element that failed to load
   * @param {Error} error - Error that occurred
   * @private
   */
  handleError(element, error) {
    console.error('Lazy loading error:', error);
    element.classList.remove(this.options.loadingClass);
    element.classList.add(this.options.errorClass);
    
    // Dispatch error event
    element.dispatchEvent(new CustomEvent('lazyloaderror', { 
      detail: { error } 
    }));
  }

  /**
   * Observes all lazy load elements on the page
   * @public
   */
  observeElements() {
    if (!this.initialized) {
      this.init();
    }

    const elements = document.querySelectorAll('[data-src], [data-content]');
    elements.forEach(element => this.observer.observe(element));
  }

  /**
   * Destroys the lazy loader instance
   * @public
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.initialized = false;
  }
}

// Export the LazyLoader class
export default LazyLoader;

// Usage example:
/*
const lazyLoader = new LazyLoader({
  selector: '.lazy',
  rootMargin: '100px 0px'
});

lazyLoader.init();

// Clean up when needed
// lazyLoader.destroy();
*/