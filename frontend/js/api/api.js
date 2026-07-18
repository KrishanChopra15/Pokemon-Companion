/**
 * =====================================================
 * API Service
 * -----------------------------------------------------
 * Handles all communication with the backend.
 * Every frontend module should use this file instead
 * of calling fetch() directly.
 * =====================================================
 */

import { getToken } from "../utils/storage.js";

// ===============================
// Configuration
// ===============================

const API_BASE_URL = "http://localhost:8000/api";

// ===============================
// Generic Request Function
// ===============================

/**
 * Send an HTTP request to the backend.
 *
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const config = {
        headers: {
            "Content-Type": "application/json",
            ...(token && {
                Authorization: `Bearer ${token}`
            }),
            ...options.headers
        },
        ...options
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

// ===============================
// Authentication APIs
// ===============================

/**
 * Register a new user.
 */
export function registerUser(userData) {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData)
    });
}

/**
 * Login existing user.
 */
export function loginUser(credentials) {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
    });
}

/**
 * Get current logged-in user.
 */
export function getCurrentUser() {
    return apiRequest("/auth/me", {
        method: "GET"
    });
}