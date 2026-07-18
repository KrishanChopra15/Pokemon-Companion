/**
 * =====================================================
 * Storage Utility
 * -----------------------------------------------------
 * Handles all browser localStorage operations.
 * This is the ONLY file that should directly access
 * localStorage.
 * =====================================================
 */

const TOKEN_KEY = "pokemon_companion_token";

/**
 * Save JWT token
 * @param {string} token
 */
export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get JWT token
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove JWT token
 */
export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
    return !!getToken();
}