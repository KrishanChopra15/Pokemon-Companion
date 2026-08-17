/**
 * Pokémon Companion
 * Starter Selection Service Test
 *
 * Tests:
 * - Starter selection
 * - Starter family lookup
 * - Blocked starter lines
 * - Allowed Pokémon check
 */

"use strict";



const StarterSelectionService =
    require("../scripts/services/starter-selection-service");









//--------------------------------
// Service
//--------------------------------


const starterService =
    new StarterSelectionService();









//--------------------------------
// Player state
//--------------------------------


const player =
{

    starter:null

};









console.log();

console.log(
    "================================"
);

console.log(
    "Starter Selection Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Select starter
//--------------------------------


console.log();

console.log(
    "Selecting Charmander:"
);


console.log(

    starterService.selectStarter(

        player,

        "CHARMANDER"

    )

);









console.log();

console.log(
    "Player state:"
);


console.log(

    player

);









//--------------------------------
// Get starter
//--------------------------------


console.log();

console.log(
    "Selected starter:"
);


console.log(

    starterService.getStarter(

        player

    )

);









//--------------------------------
// Starter family
//--------------------------------


console.log();

console.log(
    "Charmander family:"
);


console.log(

    starterService.getStarterFamily(

        "CHARMANDER"

    )

);









//--------------------------------
// Blocked families
//--------------------------------


console.log();

console.log(
    "Blocked Pokemon:"
);


console.log(

    starterService.getBlockedPokemon(

        player

    )

);









//--------------------------------
// Allowed checks
//--------------------------------


console.log();

console.log(
    "Is Charmeleon allowed?"
);


console.log(

    starterService.isAllowed(

        player,

        "CHARMELEON"

    )

);









console.log();

console.log(
    "Is Squirtle allowed?"
);


console.log(

    starterService.isAllowed(

        player,

        "SQUIRTLE"

    )

);









console.log();

console.log(
    "Is Bulbasaur allowed?"
);


console.log(

    starterService.isAllowed(

        player,

        "BULBASAUR"

    )

);









//--------------------------------
// Invalid starter
//--------------------------------


console.log();

console.log(
    "Selecting invalid starter:"
);


console.log(

    starterService.selectStarter(

        player,

        "PIKACHU"

    )

);









//--------------------------------
// No starter selected
//--------------------------------


const newPlayer =
{

    starter:null

};









console.log();

console.log(
    "Blocked Pokemon without starter:"
);


console.log(

    starterService.getBlockedPokemon(

        newPlayer

    )

);









console.log();

console.log(
    "Starter Selection Service Tests Completed."
);

console.log();