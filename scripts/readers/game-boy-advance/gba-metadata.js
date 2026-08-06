/**
 * Pokémon Companion
 * Game Boy Advance Metadata
 *
 * Represents the official Game Boy Advance ROM header.
 *
 * This is an immutable value object.
 */

"use strict";

class GameBoyAdvanceMetadata {

    constructor({
        title,
        gameCode,
        makerCode,
        unitCode,
        deviceType,
        version,
        headerChecksum,
        romSize,
    }) {

        this.title = title;
        this.gameCode = gameCode;
        this.makerCode = makerCode;
        this.unitCode = unitCode;
        this.deviceType = deviceType;
        this.version = version;
        this.headerChecksum = headerChecksum;
        this.romSize = romSize;

        Object.freeze(this);

    }

}

module.exports = GameBoyAdvanceMetadata;