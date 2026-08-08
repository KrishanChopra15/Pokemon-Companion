/**
 * Pokémon Companion
 * Extractor Test
 *
 * Verifies:
 * - Configuration Manager
 * - Source Manager
 * - Reader Factory
 * - Extractor Factory
 * - Game extraction
 * - Pokémon species extraction
 */

"use strict";

const ConfigManager = require("../scripts/shared/config/config-manager");
const SourceManager = require("../scripts/shared/source-manager/source-manager");
const ReaderFactory = require("../scripts/readers/reader-factory");
const ExtractorFactory = require("../scripts/extractors/extractor-factory");

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

    console.log("Opening ROM...");

    reader.open();

    console.log("Reader State:");
    console.log(reader.state);

    console.log();

    console.log("Creating extractor...");

    const extractor = ExtractorFactory.create(reader);

    console.log(extractor.constructor.name);

    console.log();

    console.log("Extracting game...");

    const game = extractor.extractGame();

    console.log();

    console.log("Game:");

    console.log(game);

    console.log();

    console.log("Extracting Pokémon species...");

    const species = extractor.extractPokemonSpecies();

    console.log(species);

    console.log();

    console.log("Closing ROM...");

    reader.close();

    console.log();

    console.log("Reader State:");
    console.log(reader.state);

}
catch (error) {

    console.error(error);

}