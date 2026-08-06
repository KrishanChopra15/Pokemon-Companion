/**
 * Pokémon Companion
 * Pipeline Test
 *
 * Verifies:
 * - Configuration Manager
 * - Source Manager
 * - Reader Factory
 * - Reader lifecycle
 * - ROM metadata parsing
 */

"use strict";

const ConfigManager = require("../scripts/shared/config/config-manager");
const SourceManager = require("../scripts/shared/source-manager/source-manager");
const ReaderFactory = require("../scripts/readers/reader-factory");

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

    console.log("Reading Metadata...");

    const metadata = reader.readMetadata();

    console.log();

    console.log("Metadata:");
    console.log(metadata);

    console.log();

    console.log("Closing ROM...");

    reader.close();

    console.log();

    console.log("Reader State:");
    console.log(reader.state);

    console.log();

    console.log("ROM Buffer:");
    console.log(reader.romBuffer);

    console.log();

    console.log("Binary Reader:");
    console.log(reader.binaryReader);

}
catch (error) {

    console.error(error);

}