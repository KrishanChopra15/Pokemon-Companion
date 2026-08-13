/**
 * Pokémon Companion
 * Base Builder
 *
 * Defines the common interface for every database builder.
 *
 * Responsibilities:
 * - Read raw databases.
 * - Read reference databases.
 * - Write generated databases.
 *
 * Does NOT:
 * - Understand Pokémon.
 * - Merge datasets.
 * - Implement domain-specific logic.
 */

"use strict";

const fs = require("fs");
const path = require("path");

class Builder {

    /**
     * Load a raw database.
     *
     * @param {string} database
     * @returns {*}
     */
    loadRawDatabase(game, database) {

        const file = path.join(
            process.cwd(),
            "database",
            "raw",
            game,
            `${database}.json`
        );

        return JSON.parse(
            fs.readFileSync(
                file,
                "utf8"
            )
        );

    }

    /**
     * Load a reference database.
     *
     * @param {string} database
     * @returns {*}
     */
    loadReferenceDatabase(database) {

        const file = path.join(
            process.cwd(),
            "database",
            "reference",
            `${database}.json`
        );

        return JSON.parse(
            fs.readFileSync(
                file,
                "utf8"
            )
        );

    }

    /**
     * Load a generated database.
     *
     * @param {string} game
     * @param {string} database
     * @returns {*}
     */
    loadGeneratedDatabase(game, database) {
    
        const file = path.join(
            process.cwd(),
            "database",
            "generated",
            game,
            `${database}.json`
        );
    
    
        return JSON.parse(
            fs.readFileSync(
                file,
                "utf8"
            )
        );
    
    }

    /**
     * Save a generated database.
     *
     * @param {string} database
     * @param {*} data
     */
    saveGeneratedDatabase(game, database, data) {

        const directory = path.join(
            process.cwd(),
            "database",
            "generated",
            game
        );

        fs.mkdirSync(
            directory,
            {
                recursive: true
            }
        );

        const file = path.join(
            directory,
            `${database}.json`
        );

        fs.writeFileSync(
            file,
            JSON.stringify(
                data,
                null,
                4
            )
        );

    }

}

module.exports = Builder;