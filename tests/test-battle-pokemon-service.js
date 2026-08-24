/**
 * Pokémon Companion
 * Battle Pokémon Service Test
 *
 * Tests:
 * - Get active Pokémon
 * - Invalid side handling
 * - Fainted check
 * - Alive check
 * - Count alive Pokémon
 * - Party alive check
 * - Clone party
 */

"use strict";


const BattlePokemonService =
    require("../scripts/services/battle-pokemon-service");





const pokemonService =
    new BattlePokemonService();









console.log();

console.log(
"================================"
);

console.log(
"Battle Pokémon Service Tests"
);

console.log(
"================================"
);









//--------------------------------
// Mock party
//--------------------------------


const party =
[

    {

        species:
            "CHARMANDER",


        hp:
            39,


        maxHP:
            39

    },


    {

        species:
            "PIKACHU",


        hp:
            0,


        maxHP:
            35

    },


    {

        species:
            "BULBASAUR",


        hp:
            20,


        maxHP:
            45

    }

];









const side =
{

    active:
        0,


    party

};









//--------------------------------
// Active Pokémon
//--------------------------------


console.log();

console.log(
"Get active Pokémon:"
);



console.log(

    pokemonService.getActivePokemon(

        side

    )

);









//--------------------------------
// Invalid side
//--------------------------------


console.log();

console.log(
"Invalid side:"
);



console.log(

    pokemonService.getActivePokemon(

        null

    )

);









//--------------------------------
// Fainted check
//--------------------------------


console.log();

console.log(
"Fainted check:"
);



console.log(

    {

        fainted:

            pokemonService.isFainted(

                party[1]

            ),


        alive:

            pokemonService.isFainted(

                party[0]

            )

    }

);









//--------------------------------
// Alive check
//--------------------------------


console.log();

console.log(
"Alive check:"
);



console.log(

    {

        charmander:

            pokemonService.isAlive(

                party[0]

            ),


        pikachu:

            pokemonService.isAlive(

                party[1]

            )

    }

);









//--------------------------------
// Alive count
//--------------------------------


console.log();

console.log(
"Alive Pokémon count:"
);



console.log(

    pokemonService.getAliveCount(

        party

    )

);









//--------------------------------
// Has alive Pokémon
//--------------------------------


console.log();

console.log(
"Has alive Pokémon:"
);



console.log(

    {

        party:

            pokemonService.hasAlivePokemon(

                party

            ),


        empty:

            pokemonService.hasAlivePokemon(

                []

            )

    }

);









//--------------------------------
// Clone party
//--------------------------------


console.log();

console.log(
"Clone party:"
);



const clone =

    pokemonService.cloneParty(

        party

    );





console.log(

    {

        sameReference:

            clone === party,


        sameData:

            JSON.stringify(clone)
            ===
            JSON.stringify(party)

    }

);









console.log();

console.log(
"================================"
);

console.log(
"Battle Pokémon Service Tests Completed."
);

console.log(
"================================"
);

console.log();