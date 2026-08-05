/**
 * Pokémon Companion
 * Default Configuration
 *
 * Defines the default configuration values used throughout the project.
 *
 * Responsibilities:
 * - Define project default values.
 * - Provide fallback configuration.
 *
 * Does NOT:
 * - Load configuration files.
 * - Validate configuration.
 * - Detect operating systems.
 * - Read environment variables.
 * - Read command-line arguments.
 */

"use strict";

const defaults = Object.freeze({

    /**
     * Absolute path to the Pokémon Companion Sources directory.
     *
     * This value intentionally defaults to null because every
     * developer stores the official source files in a different
     * location outside the repository.
     */
    sourcesDirectory: null,

});

module.exports = defaults;