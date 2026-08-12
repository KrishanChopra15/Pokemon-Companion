/**
 * Pokémon Companion
 * FireRed Build Pipeline
 *
 * Complete build pipeline for Pokémon FireRed.
 *
 * Responsibilities:
 * - Discover ROM
 * - Read ROM
 * - Extract Pokémon data
 * - Generate raw database
 * - Generate reference databases
 * - Build generated databases
 */

"use strict";

const ConfigManager = require("../shared/config/config-manager");
const SourceManager = require("../shared/source-manager/source-manager");

const ReaderFactory = require("../readers/reader-factory");
const ExtractorFactory = require("../extractors/extractor-factory");

const BuildManager = require("../builders/build-manager");

class FireRedBuildPipeline {

    run() {

        console.log("========================================");
        console.log("Pokémon FireRed Build Pipeline");
        console.log("========================================");
        console.log();

        //----------------------------------------------------------
        // Load configuration
        //----------------------------------------------------------

        console.log("Loading configuration...");

        const config = ConfigManager.load();

        //----------------------------------------------------------
        // Discover ROM
        //----------------------------------------------------------

        console.log("Discovering sources...");

        const sourceManager = new SourceManager(
            config.sourcesDirectory
        );

        const sources = sourceManager.discover();

        if (sources.length === 0) {

            throw new Error(
                "No ROM sources were discovered."
            );

        }

        const source = sources[0];

        //----------------------------------------------------------
        // Open ROM
        //----------------------------------------------------------

        console.log("Opening ROM...");

        const reader = ReaderFactory.create(source);

        reader.open();

        //----------------------------------------------------------
        // Extract game
        //----------------------------------------------------------

        console.log("Extracting game...");

        const extractor = ExtractorFactory.create(reader);

        extractor.extractGame();

        //----------------------------------------------------------
        // Extract Pokémon species
        //----------------------------------------------------------

        console.log("Extracting Pokémon species...");

        const species = extractor.extractPokemonSpecies();

        //----------------------------------------------------------
        // Extract Pokémon moves
        //----------------------------------------------------------

        console.log("Extracting Pokémon moves...");

        const moves = extractor.extractMoves();

        //----------------------------------------------------------
        // Build databases
        //----------------------------------------------------------

        const buildManager = new BuildManager();

        buildManager.buildGame(
            "firered",
            {
                species,
                moves
            }
        );

        //----------------------------------------------------------
        // Close ROM
        //----------------------------------------------------------

        reader.close();

        console.log();

        console.log("========================================");
        console.log("FireRed build completed successfully.");
        console.log("========================================");

    }

}

module.exports = FireRedBuildPipeline;