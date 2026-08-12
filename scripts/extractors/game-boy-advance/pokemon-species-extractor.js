/**
 * Pokémon Companion
 * Game Boy Advance Pokémon Species Extractor
 *
 * Extracts Pokémon species from the pokefirered source.
 *
 * Responsibilities:
 * - Read species_info.h.
 * - Parse Pokémon species data.
 * - Produce Pokémon Species objects.
 *
 * Does NOT:
 * - Open ROMs.
 * - Read binary data.
 * - Extract unrelated datasets.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const PokemonSpeciesParser =
    require("../../parsers/game-boy-advance/species-info-parser");


class PokemonSpeciesExtractor {


    /**
     * Create Pokémon Species Extractor.
     *
     * @param {GameBoyAdvanceReader} reader
     * @param {Game} game
     * @param {BinaryLayout} layout
     */
    constructor(reader, game, layout) {

        this.reader = reader;
        this.game = game;
        this.layout = layout;

    }


    /**
     * Extract all Pokémon species.
     *
     * @returns {Object[]}
     */
    extractAll() {


        const sourceFile = path.join(

            process.cwd(),

            "..",

            "References",

            "pokefirered",

            "src",

            "data",

            "pokemon",

            "species_info.h"

        );


        const source =
            fs.readFileSync(
                sourceFile,
                "utf8"
            );


        const parser =
            new PokemonSpeciesParser();


        return parser.parse(source);

    }


}


module.exports = PokemonSpeciesExtractor;