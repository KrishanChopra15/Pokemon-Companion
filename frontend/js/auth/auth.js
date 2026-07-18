/**
 * =====================================================
 * Authentication Service
 * -----------------------------------------------------
 * Handles login, registration, logout, and
 * authentication-related frontend logic.
 * =====================================================
 */

import {
    loginUser,
    registerUser,
    getCurrentUser
} from "../api/api.js";

import {
    saveToken,
    removeToken,
    isLoggedIn
} from "../utils/storage.js";

/**
 * Register a new user.
 * @param {Object} userData
 */
export async function register(userData) {

    const response = await registerUser(userData);

    saveToken(response.data.token);

    return response.data.user;
}

/**
 * Login user.
 * @param {Object} credentials
 */
export async function login(credentials) {

    const response = await loginUser(credentials);

    saveToken(response.data.token);

    return response.data.user;
}

/**
 * Logout user.
 */
export function logout() {

    removeToken();
}

/**
 * Get logged-in user's profile.
 */
export async function getProfile() {

    return await getCurrentUser();
}

/**
 * Check authentication status.
 */
export function checkAuth() {

    return isLoggedIn();
}