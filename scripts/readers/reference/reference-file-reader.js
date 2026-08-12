/**
 * Pokémon Companion
 * Reference File Reader
 *
 * Reads text files from a reference repository.
 *
 * Responsibilities:
 * - Read reference files.
 * - Return file contents.
 *
 * Does NOT:
 * - Parse file contents.
 * - Understand Pokémon data.
 * - Generate databases.
 */

"use strict";

const fs = require("fs");
const path = require("path");

class ReferenceFileReader {

    /**
     * Create a Reference File Reader.
     *
     * @param {string} referenceDirectory
     */
    constructor(referenceDirectory) {

        this.referenceDirectory = referenceDirectory;

    }

    /**
     * Read a reference file.
     *
     * @param {string} relativePath
     * @returns {string}
     */
    read(relativePath) {

        const absolutePath = path.join(
            this.referenceDirectory,
            relativePath
        );

        if (!fs.existsSync(absolutePath)) {

            throw new Error(
                `Reference file does not exist:\n${absolutePath}`
            );

        }

        return fs.readFileSync(
            absolutePath,
            "utf8"
        );

    }

}

module.exports = ReferenceFileReader;