/**
 * Pokémon Companion
 * Base Reader
 *
 * Defines the common interface for every platform reader.
 *
 * Responsibilities:
 * - Represent an opened source.
 * - Define the common reader lifecycle.
 * - Define the public reader contract.
 *
 * Does NOT:
 * - Read any specific platform.
 * - Extract Pokémon data.
 * - Implement platform-specific logic.
 */

"use strict";

/**
 * Reader lifecycle states.
 */
const ReaderState = Object.freeze({
    CREATED: "created",
    OPEN: "open",
    CLOSED: "closed",
});

class Reader {

    /**
     * Create a reader.
     *
     * @param {Source} source
     */
    constructor(source) {

        this.source = source;
        this.state = ReaderState.CREATED;

    }

    /**
     * Open the source.
     */
    open() {

        throw new Error("open() must be implemented by the platform reader.");

    }

    /**
     * Read source metadata.
     */
    readMetadata() {

        throw new Error("readMetadata() must be implemented by the platform reader.");

    }

    /**
     * Read a range of bytes.
     *
     * @param {number} offset
     * @param {number} length
     * @returns {Buffer}
     */
    readBytes(offset, length) {
    
        throw new Error(
            "readBytes() must be implemented by the platform reader."
        );
    
    }

    /**
     * List files contained in the source.
     */
    listFiles() {

        throw new Error("listFiles() must be implemented by the platform reader.");

    }

    /**
     * Read a file from the source.
     *
     * @param {string} path
     */
    readFile(path) {

        throw new Error("readFile() must be implemented by the platform reader.");

    }

    /**
     * Close the source.
     */
    close() {

        throw new Error("close() must be implemented by the platform reader.");

    }

}

module.exports = {
    Reader,
    ReaderState,
};