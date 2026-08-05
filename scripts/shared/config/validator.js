/**
 * Pokémon Companion
 * Configuration Validator
 *
 * Validates project configuration before it is used by any subsystem.
 *
 * Responsibilities:
 * - Validate configuration values.
 * - Throw clear errors when configuration is invalid.
 *
 * Does NOT:
 * - Load configuration files.
 * - Apply default values.
 * - Modify configuration.
 * - Create directories.
 */

"use strict";

const path = require("path");

class ConfigurationValidator {

    /**
     * Validate the project configuration.
     *
     * @param {Object} configuration
     */
    static validate(configuration) {

        if (!configuration) {
            throw new Error(
                "Configuration Error: No configuration object was provided."
            );
        }

        if (!configuration.sourcesDirectory) {
            throw new Error(
                "Configuration Error: 'sourcesDirectory' is required."
            );
        }

        if (typeof configuration.sourcesDirectory !== "string") {
            throw new Error(
                "Configuration Error: 'sourcesDirectory' must be a string."
            );
        }

        if (!path.isAbsolute(configuration.sourcesDirectory)) {
            throw new Error(
                "Configuration Error: 'sourcesDirectory' must be an absolute path."
            );
        }

    }

}

module.exports = ConfigurationValidator;