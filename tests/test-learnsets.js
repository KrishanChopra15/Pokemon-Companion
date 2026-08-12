/**
 * Pokémon Companion
 * Learnset Extraction Test
 *
 * Tests Pokémon level-up learnset extraction.
 */

"use strict";


const PokemonLearnsetExtractor =
require("../scripts/extractors/game-boy-advance/pokemon-learnset-extractor");


const extractor =
new PokemonLearnsetExtractor();


const learnsets =
extractor.extractAll();



console.log(
    "Total learnsets:",
    learnsets.length
);



console.log(
    JSON.stringify(
        learnsets[0],
        null,
        4
    )
);