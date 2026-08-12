/**
 * Pokémon Companion
 * Reference Generator
 *
 * Base class for all reference database generators.
 *
 * Responsibilities:
 * - Read reference source files.
 * - Write reference databases.
 * - Provide common generator utilities.
 *
 * Does NOT:
 * - Parse specific reference data.
 */

"use strict";

const fs = require("fs");
const path = require("path");

class ReferenceGenerator {

    /**
     * Read a reference source file.
     *
     * @param {string[]} segments
     * @returns {string}
     */
    readSourceFile(...segments) {

        const file = path.join(
            process.cwd(),
            "..",
            "References",
            ...segments
        );

        return fs.readFileSync(
            file,
            "utf8"
        );

    }

    /**
     * Write a reference database.
     *
     * @param {string} database
     * @param {*} data
     */
    writeDatabase(database, data) {

        const directory = path.join(
            process.cwd(),
            "database",
            "reference"
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

        console.log(
            `Generated ${file}`
        );

        console.log(
            `${data.length} records generated.`
        );

    }

}

module.exports = ReferenceGenerator;