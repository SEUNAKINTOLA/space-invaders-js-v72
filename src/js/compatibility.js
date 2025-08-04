/**
 * @fileoverview Browser Compatibility Module
 * Handles cross-browser compatibility, feature detection, and polyfills
 * 
 * @module compatibility
 * @author AI Assistant
 * @version 1.0.0
 */

/**
 * Configuration object for browser feature requirements
 * @const {Object}
 */
const REQUIRED_FEATURES = {
  INTERSECTION_OBSERVER: 'IntersectionObserver',
  FETCH: 'fetch',
  PROMISE: 'Promise',
  LOCAL_STORAGE: 'localStorage',
  SERVICE_WORKER: 'serviceWorker'
};

/**
 * @typedef {Object} BrowserSupport
 * @property {boolean} supported - Whether the browser is supported
 * @property {string[]} missingFeatures - List of unsupported features
 */

/**
 * Class handling browser compatibility checks and polyfills
 */
class BrowserCompatibility {
  constructor() {
    this.missingFeatures = [];
    this.polyfillsLoaded = false;
  }

  /**
   * Checks if the current browser supports all required features
   * @returns {BrowserSupport} Object containing support status and missing features
   */
  checkBrowserSupport() {
    this.missingFeatures = [];

    try {
      // Check IntersectionObserver support
      if (!('IntersectionObserver' in window)) {
        this.missingFeatures.push(REQUIRED_FEATURES.INTERSECTION_OBSERVER);
      }

      // Check Fetch API support
      if (!('fetch' in window)) {
        this.missingFeatures.push(REQUIRED_FEATURES.FETCH);
      }

      // Check Promise support
      if (!('Promise' in window)) {
        this.missingFeatures.push(REQUIRED_FEATURES.PROMISE);
      }

      // Check localStorage support
      if (!this._checkLocalStorageSupport()) {
        this.missingFeatures.push(REQUIRED_FEATURES.LOCAL_STORAGE);
      }

      // Check Service Worker support
      if (!('serviceWorker' in navigator)) {
        this.missingFeatures.push(REQUIRED_FEATURES.SERVICE_WORKER);
      }

      return {
        supported: this.missingFeatures.length === 0,
        missingFeatures: this.missingFeatures
      };
    } catch (error) {
      console.error('Error checking browser support:', error);
      return {
        supported: false,
        missingFeatures: ['Unknown - Error during feature detection']
      };
    }
  }

  /**
   * Loads necessary polyfills based on missing features
   * @returns {Promise<void>}
   */
  async loadPolyfills() {
    if (this.polyfillsLoaded) return;

    try {
      const polyfillsToLoad = [];

      // Add required polyfills based on missing features
      if (this.missingFeatures.includes(REQUIRED_FEATURES.INTERSECTION_OBSERVER)) {
        polyfillsToLoad.push(this._loadIntersectionObserverPolyfill());
      }

      if (this.missingFeatures.includes(REQUIRED_FEATURES.FETCH)) {
        polyfillsToLoad.push(this._loadFetchPolyfill());
      }

      if (this.missingFeatures.includes(REQUIRED_FEATURES.PROMISE)) {
        polyfillsToLoad.push(this._loadPromisePolyfill());
      }

      await Promise.all(polyfillsToLoad);
      this.polyfillsLoaded = true;
    } catch (error) {
      console.error('Error loading polyfills:', error);
      throw new Error('Failed to load required polyfills');
    }
  }

  /**
   * Checks if localStorage is supported and working
   * @returns {boolean}
   * @private
   */
  _checkLocalStorageSupport() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Loads IntersectionObserver polyfill
   * @returns {Promise<void>}
   * @private
   */
  async _loadIntersectionObserverPolyfill() {
    try {
      await import('intersection-observer');
    } catch (error) {
      console.error('Failed to load IntersectionObserver polyfill:', error);
      throw error;
    }
  }

  /**
   * Loads Fetch API polyfill
   * @returns {Promise<void>}
   * @private
   */
  async _loadFetchPolyfill() {
    try {
      await import('whatwg-fetch');
    } catch (error) {
      console.error('Failed to load Fetch polyfill:', error);
      throw error;
    }
  }

  /**
   * Loads Promise polyfill
   * @returns {Promise<void>}
   * @private
   */
  async _loadPromisePolyfill() {
    try {
      await import('promise-polyfill');
    } catch (error) {
      console.error('Failed to load Promise polyfill:', error);
      throw error;
    }
  }
}

/**
 * Creates and initializes browser compatibility checker
 * @returns {Promise<BrowserCompatibility>}
 */
export async function initializeBrowserCompatibility() {
  const compatibility = new BrowserCompatibility();
  const support = compatibility.checkBrowserSupport();

  if (!support.supported) {
    console.warn('Browser missing required features:', support.missingFeatures);
    await compatibility.loadPolyfills();
  }

  return compatibility;
}

/**
 * Checks if the current browser is supported
 * @returns {boolean}
 */
export function isBrowserSupported() {
  const compatibility = new BrowserCompatibility();
  return compatibility.checkBrowserSupport().supported;
}

/**
 * Gets the list of unsupported features for the current browser
 * @returns {string[]}
 */
export function getUnsupportedFeatures() {
  const compatibility = new BrowserCompatibility();
  return compatibility.checkBrowserSupport().missingFeatures;
}

export default BrowserCompatibility;