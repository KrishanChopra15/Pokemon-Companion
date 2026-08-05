/**
 * Pokémon Companion
 * Pipeline Test
 *
 * Verifies:
 * - Configuration Manager
 * - Source Manager
 * - Reader Factory
 * - Reader lifecycle
 */

"use strict";

const ConfigManager = require("./shared/config/config-manager");
const SourceManager = require("./shared/source-manager/source-manager");
const ReaderFactory = require("./readers/reader-factory");

try {

    console.log("Loading configuration...");

    const config = ConfigManager.load();

    console.log("Sources Directory:");
    console.log(config.sourcesDirectory);

    console.log();

    console.log("Discovering sources...");

    const sourceManager = new SourceManager(config.sourcesDirectory);

    const sources = sourceManager.discover();

    console.log(`Found ${sources.length} source(s).`);

    console.log();

    if (sources.length === 0) {
        throw new Error("No sources were discovered.");
    }

    const source = sources[0];

    console.log("Creating reader...");

    const reader = ReaderFactory.create(source);

    console.log(reader.constructor.name);

    console.log();

    console.log("Initial Reader State:");
    console.log(reader.state);

    console.log();

    console.log("Opening ROM...");

    reader.open();

    console.log();

    console.log("Reader State:");
    console.log(reader.state);

    console.log();

    console.log("ROM Size:");
    console.log(`${reader.romBuffer.length.toLocaleString()} bytes`);

    console.log();

    console.log("Closing ROM...");

    reader.close();

    console.log();

    console.log("Reader State:");
    console.log(reader.state);

    console.log();

    console.log("ROM Buffer:");
    console.log(reader.romBuffer);

}
catch (error) {

    console.error(error);

}