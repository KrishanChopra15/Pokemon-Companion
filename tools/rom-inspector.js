/**
 * Pokémon Companion
 * ROM Inspector
 *
 * Developer utility for inspecting Game Boy Advance ROMs.
 *
 * Responsibilities:
 * - Read bytes at a given offset.
 * - Display hexadecimal values.
 * - Display decimal values.
 * - Display ASCII representation.
 *
 * This tool is for development and debugging only.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ConfigManager = require("../scripts/shared/config/config-manager");
const SourceManager = require("../scripts/shared/source-manager/source-manager");

try {

    const config = ConfigManager.load();

    const sourceManager = new SourceManager(
        config.sourcesDirectory
    );

    const sources = sourceManager.discover();

    if (sources.length === 0) {
        throw new Error("No ROM sources found.");
    }

    const rom = fs.readFileSync(
        sources[0].absolutePath
    );

    //
    // ----------------------------------------------------
    // Configuration
    // ----------------------------------------------------
    //

    const OFFSET = 0x254848;
    const LENGTH = 28;

    //
    // ----------------------------------------------------
    //

    const bytes = rom.subarray(
        OFFSET,
        OFFSET + LENGTH
    );

    console.log("----------------------------------------");
    console.log("ROM Inspector");
    console.log("----------------------------------------");
    console.log();

    console.log(`Offset : 0x${OFFSET.toString(16).toUpperCase()}`);
    console.log(`Length : ${LENGTH} bytes`);

    console.log();

    console.log("Hex:");
    console.log(
        bytes.toString("hex")
            .match(/.{1,2}/g)
            .join(" ")
    );

    console.log();

    console.log("Decimal:");
    console.log(
        [...bytes].join(" ")
    );

    console.log();

    console.log("ASCII:");
    console.log(
        bytes
            .toString("ascii")
            .replace(/[^\x20-\x7E]/g, ".")
    );

}
catch (error) {

    console.error(error);

}