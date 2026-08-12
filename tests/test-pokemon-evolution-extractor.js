"use strict";

const PokemonEvolutionExtractor = require(
    "../scripts/extractors/game-boy-advance/pokemon-evolution-extractor"
);

const extractor = new PokemonEvolutionExtractor();

const evolutions = extractor.extractAll();

console.log(
    JSON.stringify(
        evolutions.find(
            e => e.species === "SPECIES_EEVEE"
        ),
        null,
        4
    )
);