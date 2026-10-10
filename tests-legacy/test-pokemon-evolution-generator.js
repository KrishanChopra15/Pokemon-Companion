"use strict";

const PokemonEvolutionGenerator = require(
    "../scripts/generators/raw/pokemon-evolution-generator"
);

const generator = new PokemonEvolutionGenerator();

generator.generate(
    "firered"
);