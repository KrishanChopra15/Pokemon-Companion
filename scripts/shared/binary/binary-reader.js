/**
 * Pokémon Companion
 * Binary Reader
 *
 * Provides helper methods for reading binary data from a Buffer.
 *
 * Responsibilities:
 * - Read primitive values from a Buffer.
 * - Decode strings.
 * - Read byte ranges.
 *
 * Does NOT:
 * - Understand any file format.
 * - Understand any platform.
 * - Understand Pokémon.
 */

"use strict";

class BinaryReader {

    /**
     * Create a Binary Reader.
     *
     * @param {Buffer} buffer
     */
    constructor(buffer) {

        this.buffer = buffer;

    }

    /**
     * Read an unsigned 8-bit integer.
     *
     * @param {number} offset
     * @returns {number}
     */
    readUInt8(offset) {

        return this.buffer.readUInt8(offset);

    }

    /**
     * Read an ASCII string.
     *
     * @param {number} offset
     * @param {number} length
     * @returns {string}
     */
    readString(offset, length) {

        return this.buffer
            .toString("ascii", offset, offset + length)
            .replace(/\0+$/, "")
            .trim();

    }

}

module.exports = BinaryReader;