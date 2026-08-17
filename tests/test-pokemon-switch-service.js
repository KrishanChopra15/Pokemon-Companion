/**
 * Pokémon Companion
 * Pokémon Switch Service Test
 *
 * Tests:
 * - Available Pokémon
 * - Switch validation
 * - Switching active Pokémon
 * - Fainted Pokémon rejection
 * - Forced switch detection
 * - Auto switching
 */

"use strict";



const PokemonSwitchService =
    require("../scripts/services/pokemon-switch-service");









//--------------------------------
// Service
//--------------------------------


const switchService =
    new PokemonSwitchService();









//--------------------------------
// Mock party
//--------------------------------


const player =
{

    party:
    [

        {

            species:
                "CHARMANDER",

            level:
                10,

            hp:
                35

        },


        {

            species:
                "PIKACHU",

            level:
                12,

            hp:
                40

        },


        {

            species:
                "SQUIRTLE",

            level:
                11,

            hp:
                0

        }

    ],


    active:
        0

};









console.log();

console.log(
    "================================"
);

console.log(
    "Pokemon Switch Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Available Pokémon
//--------------------------------


console.log();

console.log(
    "Available Pokemon:"
);


console.log(

    switchService.getAvailablePokemon(

        player

    )

);









//--------------------------------
// Active Pokémon
//--------------------------------


console.log();

console.log(
    "Current active Pokemon:"
);


console.log(

    switchService.getActivePokemon(

        player

    )

);









//--------------------------------
// Switch validation
//--------------------------------


console.log();

console.log(
    "Can switch to Pikachu:"
);


console.log(

    switchService.canSwitch(

        player,

        1

    )

);









//--------------------------------
// Perform switch
//--------------------------------


console.log();

console.log(
    "Switching to Pikachu:"
);


console.log(

    switchService.switchPokemon(

        player,

        1

    )

);









//--------------------------------
// After switch
//--------------------------------


console.log();

console.log(
    "Active Pokemon after switch:"
);


console.log(

    switchService.getActivePokemon(

        player

    )

);









//--------------------------------
// Fainted switch test
//--------------------------------


console.log();

console.log(
    "Trying fainted Squirtle:"
);


console.log(

    switchService.canSwitch(

        player,

        2

    )

);









//--------------------------------
// Force switch
//--------------------------------


console.log();

console.log(
    "Needs switch:"
);


console.log(

    switchService.needsSwitch(

        player

    )

);









//--------------------------------
// Auto switch
//--------------------------------


console.log();

console.log(
    "Auto switch:"
);


player.active = 2;



console.log(

    switchService.autoSwitch(

        player

    )

);









console.log();

console.log(
    "Final active Pokemon:"
);


console.log(

    switchService.getActivePokemon(

        player

    )

);









console.log();

console.log(
    "Pokemon Switch Tests Completed."
);

console.log();