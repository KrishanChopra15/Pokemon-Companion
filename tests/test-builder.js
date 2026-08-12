/**
 * Pokémon Companion
 * Builder Test
 *
 * Verifies:
 * - Raw database loading
 * - Reference database loading
 * - Generated database creation
 */

"use strict";

const PokemonSpeciesBuilder = require(
    "../scripts/builders/pokemon-species-builder"
);

try {

    console.log("========================================");
    console.log("Pokémon Species Builder Test");
    console.log("========================================");

    console.log();

    console.log("Creating builder...");

    const builder = new PokemonSpeciesBuilder();

    console.log(builder.constructor.name);

    console.log();

    console.log("Building generated Pokémon species database...");

    builder.build("firered");

    console.log();

    console.log("Build completed successfully.");

    console.log();

}
catch (error) {

    console.error(error);

}