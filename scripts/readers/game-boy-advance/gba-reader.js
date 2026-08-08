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

const BinaryReader = require("../../shared/binary/binary-reader");

const { Reader, ReaderState } = require("../reader");

const GBAHeader = require("./gba-header");
const GameBoyAdvanceMetadata = require("./gba-metadata");

class GameBoyAdvanceReader extends Reader {

    /**
     * Create a Game Boy Advance Reader.
     *
     * @param {Source} source
     */
    constructor(source) {

        super(source);

        this.romBuffer = null;
        this.binaryReader = null;

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

        this.binaryReader = new BinaryReader(this.romBuffer);

        this.state = ReaderState.OPEN;

    }

    /**
     * Read ROM metadata.
     *
     * @returns {GameBoyAdvanceMetadata}
     */
    readMetadata() {

        if (this.state !== ReaderState.OPEN) {
            throw new Error(
                `Cannot read metadata while in '${this.state}' state.`
            );
        }

        return new GameBoyAdvanceMetadata({

            title: this.binaryReader.readString(
                GBAHeader.TITLE_OFFSET,
                GBAHeader.TITLE_LENGTH
            ),

            gameCode: this.binaryReader.readString(
                GBAHeader.GAME_CODE_OFFSET,
                GBAHeader.GAME_CODE_LENGTH
            ),

            makerCode: this.binaryReader.readString(
                GBAHeader.MAKER_CODE_OFFSET,
                GBAHeader.MAKER_CODE_LENGTH
            ),

            unitCode: this.binaryReader.readUInt8(
                GBAHeader.UNIT_CODE_OFFSET
            ),

            deviceType: this.binaryReader.readUInt8(
                GBAHeader.DEVICE_TYPE_OFFSET
            ),

            version: this.binaryReader.readUInt8(
                GBAHeader.VERSION_OFFSET
            ),

            headerChecksum: this.binaryReader.readUInt8(
                GBAHeader.HEADER_CHECKSUM_OFFSET
            ),

            romSize: this.romBuffer.length

        });

    }

    /**
     * Read a range of bytes.
     *
     * @param {number} offset
     * @param {number} length
     * @returns {Buffer}
     */
    readBytes(offset, length) {
    
        if (this.state !== ReaderState.OPEN) {
            throw new Error(
                `Cannot read bytes while in '${this.state}' state.`
            );
        }
    
        return this.binaryReader.readBytes(offset, length);
    
    }

    /**
     * Read an unsigned 8-bit integer.
     *
     * @param {number} offset
     * @returns {number}
     */
    readUInt8(offset) {

        if (this.state !== ReaderState.OPEN) {
            throw new Error(
                `Cannot read ROM while in '${this.state}' state.`
            );
        }

        return this.binaryReader.readUInt8(offset);

    }

    /**
     * Read an unsigned 16-bit integer.
     *
     * @param {number} offset
     * @returns {number}
     */
    readUInt16(offset) {

        if (this.state !== ReaderState.OPEN) {
            throw new Error(
                `Cannot read ROM while in '${this.state}' state.`
            );
        }

        return this.binaryReader.readUInt16(offset);

    }

    /**
     * Read an unsigned 32-bit integer.
     *
     * @param {number} offset
     * @returns {number}
     */
    readUInt32(offset) {

        if (this.state !== ReaderState.OPEN) {
            throw new Error(
                `Cannot read ROM while in '${this.state}' state.`
            );
        }

        return this.binaryReader.readUInt32(offset);

    }

    /**
     * Read bytes from the ROM.
     *
     * @param {number} offset
     * @param {number} length
     * @returns {Buffer}
     */
    readBytes(offset, length) {

        if (this.state !== ReaderState.OPEN) {
            throw new Error(
                `Cannot read ROM while in '${this.state}' state.`
            );
        }

        return this.binaryReader.readBytes(offset, length);

    }

    /**
     * Read a string from the ROM.
     *
     * @param {number} offset
     * @param {number} length
     * @returns {string}
     */
    readString(offset, length) {

        if (this.state !== ReaderState.OPEN) {
            throw new Error(
                `Cannot read ROM while in '${this.state}' state.`
            );
        }

        return this.binaryReader.readString(offset, length);

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

        this.binaryReader = null;
        this.romBuffer = null;

        this.state = ReaderState.CLOSED;

    }

}

module.exports = GameBoyAdvanceReader;