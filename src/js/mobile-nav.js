/**
 * @fileoverview Mobile Navigation Handler
 * Manages mobile navigation functionality including hamburger menu,
 * responsive behavior, and touch interactions.
 * 
 * @module mobile-nav
 * @author AI Assistant
 * @version 1.0.0
 */

// Constants
const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024
};

const CLASSES = {
    ACTIVE: 'is-active',
    VISIBLE: 'is-visible',
    NO_SCROLL: 'no-scroll',
    MENU_OPEN: 'menu-open'
};

const SELECTORS = {
    NAV_TOGGLE: '[data-nav-toggle]',
    MOBILE_NAV: '[data-mobile-nav]',
    NAV_OVERLAY: '[data-nav-overlay]',
    SUB_MENU_TOGGLE: '[data-submenu-toggle]'
};

/**
 * MobileNav class handles all mobile navigation functionality
 */
class MobileNav {
    /**
     * Initialize mobile navigation
     * @constructor
     */
    constructor() {
        this.isOpen = false;
        this.touchStartY = 0;
        this.touchEndY = 0;

        // DOM Elements
        this.navToggle = document.querySelector(SELECTORS.NAV_TOGGLE);
        this.mobileNav = document.querySelector(SELECTORS.MOBILE_NAV);
        this.overlay = document.querySelector(SELECTORS.NAV_OVERLAY);
        this.subMenuToggles = document.querySelectorAll(SELECTORS.SUB_MENU_TOGGLE);

        if (!this.navToggle || !this.mobileNav) {
            console.error('Required mobile navigation elements not found');
            return;
        }

        this.initializeEventListeners();
    }

    /**
     * Set up event listeners for mobile navigation
     * @private
     */
    initializeEventListeners() {
        // Toggle menu
        this.navToggle.addEventListener('click', () => this.toggleMenu());

        // Overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMenu());
        }

        // Sub-menu toggles
        this.subMenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => this.handleSubMenuToggle(e));
        });

        // Touch events for swipe
        this.mobileNav.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.mobileNav.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Resize handler
        window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));

        // Escape key handler
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    /**
     * Toggle mobile menu state
     * @public
     */
    toggleMenu() {
        try {
            this.isOpen = !this.isOpen;
            this.navToggle.classList.toggle(CLASSES.ACTIVE);
            this.mobileNav.classList.toggle(CLASSES.VISIBLE);
            document.body.classList.toggle(CLASSES.NO_SCROLL);
            
            if (this.overlay) {
                this.overlay.classList.toggle(CLASSES.VISIBLE);
            }

            // Trigger custom event
            this.mobileNav.dispatchEvent(
                new CustomEvent('menuStateChange', { detail: { isOpen: this.isOpen } })
            );
        } catch (error) {
            console.error('Error toggling menu:', error);
        }
    }

    /**
     * Close mobile menu
     * @public
     */
    closeMenu() {
        if (this.isOpen) {
            this.toggleMenu();
        }
    }

    /**
     * Handle sub-menu toggle clicks
     * @private
     * @param {Event} event - Click event
     */
    handleSubMenuToggle(event) {
        try {
            const toggle = event.currentTarget;
            const subMenu = toggle.nextElementSibling;

            if (subMenu) {
                toggle.classList.toggle(CLASSES.ACTIVE);
                subMenu.classList.toggle(CLASSES.VISIBLE);
            }
        } catch (error) {
            console.error('Error handling sub-menu toggle:', error);
        }
    }

    /**
     * Handle touch start event
     * @private
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        this.touchStartY = event.touches[0].clientY;
    }

    /**
     * Handle touch end event
     * @private
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        this.touchEndY = event.changedTouches[0].clientY;
        this.handleSwipe();
    }

    /**
     * Process swipe gesture
     * @private
     */
    handleSwipe() {
        const SWIPE_THRESHOLD = 50;
        const swipeDistance = this.touchStartY - this.touchEndY;

        if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
            if (swipeDistance > 0) {
                // Swipe up
                this.closeMenu();
            }
        }
    }

    /**
     * Handle window resize events
     * @private
     */
    handleResize() {
        if (window.innerWidth > BREAKPOINTS.MOBILE && this.isOpen) {
            this.closeMenu();
        }
    }

    /**
     * Handle keyboard events
     * @private
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyPress(event) {
        if (event.key === 'Escape' && this.isOpen) {
            this.closeMenu();
        }
    }

    /**
     * Debounce function for resize handler
     * @private
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Export singleton instance
export default new MobileNav();