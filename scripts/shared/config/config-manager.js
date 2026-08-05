/**
 * Pokémon Companion
 * Configuration Manager
 *
 * Loads, validates, and provides the project configuration.
 *
 * Responsibilities:
 * - Load local configuration.
 * - Apply default configuration values.
 * - Validate configuration.
 * - Cache the validated configuration.
 * - Return an immutable configuration object.
 *
 * Does NOT:
 * - Discover source files.
 * - Read ROMs.
 * - Create directories.
 * - Modify configuration after loading.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const defaults = require("./defaults");
const ConfigurationValidator = require("./validator");

class ConfigManager {

    /**
     * Cached configuration.
     *
     * @type {Object|null}
     */
    static configuration = null;

    /**
     * Load the project configuration.
     *
     * @returns {Object}
     */
    static load() {

        // Return cached configuration.
        if (this.configuration) {
            return this.configuration;
        }

        const configurationPath = path.resolve(
            __dirname,
            "../../../config/config.local.json"
        );

        if (!fs.existsSync(configurationPath)) {
            throw new Error(
                "Configuration Error: Missing 'config/config.local.json'."
            );
        }

        const localConfiguration = JSON.parse(
            fs.readFileSync(configurationPath, "utf8")
        );

        const configuration = {
            ...defaults,
            ...localConfiguration,
        };

        ConfigurationValidator.validate(configuration);

        this.configuration = Object.freeze(configuration);

        return this.configuration;
    }

}

module.exports = ConfigManager;