/**
 * Pokémon Companion
 * Reference Database Reader
 *
 * Reads generated reference databases.
 *
 * Responsibilities:
 * - Read generated JSON reference databases.
 *
 * Does NOT:
 * - Parse source files.
 * - Understand Pokémon.
 * - Generate databases.
 */

"use strict";

const fs = require("fs");
const path = require("path");

class ReferenceDatabaseReader {

    /**
     * Read a reference database.
     *
     * @param {string} databaseName
     * @returns {*}
     */
    read(databaseName) {

        const file = path.join(
            process.cwd(),
            "database",
            "reference",
            `${databaseName}.json`
        );

        if (!fs.existsSync(file)) {

            throw new Error(
                `Reference database not found:\n${file}`
            );

        }

        return JSON.parse(
            fs.readFileSync(
                file,
                "utf8"
            )
        );

    }

}

module.exports = ReferenceDatabaseReader;