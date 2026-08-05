/**
 * Pokémon Companion
 * Game Boy Advance Reader
 *
 * Provides access to Game Boy Advance ROM files.
 *
 * Responsibilities:
 * - Open GBA ROMs.
 * - Read ROM metadata.
 * - Read bytes from the ROM.
 * - Provide platform-specific access to GBA ROM data.
 *
 * Does NOT:
 * - Understand Pokémon.
 * - Extract game data.
 * - Parse Pokémon structures.
 */

"use strict";

const fs = require("fs");

const { Reader, ReaderState } = require("../reader");

class GameBoyAdvanceReader extends Reader {

    /**
     * Create a Game Boy Advance Reader.
     *
     * @param {Source} source
     */
    constructor(source) {

        super(source);

        this.romBuffer = null;

    }

    /**
     * Open the ROM.
     */
    open() {

        if (this.state !== ReaderState.CREATED) {
            throw new Error(
                `Cannot open reader while in '${this.state}' state.`
            );
        }

        this.romBuffer = fs.readFileSync(this.source.absolutePath);

        this.state = ReaderState.OPEN;

    }

    /**
     * Read ROM metadata.
     */
    readMetadata() {

        throw new Error("Not implemented.");

    }

    /**
     * List files contained in the source.
     */
    listFiles() {

        throw new Error("Not implemented.");

    }

    /**
     * Read a file from the source.
     *
     * @param {string} path
     */
    readFile(path) {

        throw new Error("Not implemented.");

    }

    /**
     * Close the ROM.
     */
    close() {

        if (this.state !== ReaderState.OPEN) {
            throw new Error(
                `Cannot close reader while in '${this.state}' state.`
            );
        }

        this.romBuffer = null;

        this.state = ReaderState.CLOSED;

    }

}

module.exports = GameBoyAdvanceReader;