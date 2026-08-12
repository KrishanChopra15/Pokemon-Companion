/**
 * Pokémon Companion
 * Encounter Builder Test
 */

"use strict";


const PokemonEncounterBuilder =
    require("../scripts/builders/pokemon-encounter-builder");


try {


    const builder =
        new PokemonEncounterBuilder();


    builder.build(
        "firered"
    );


}
catch(error) {

    console.error(error);

}