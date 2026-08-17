/**
 * Pokémon Companion
 * Pokémon Availability Builder Test
 *
 * Tests:
 * - Starter availability
 * - Starter evolution availability
 * - Starter selection restrictions
 * - Trade starter availability
 * - Gym progression
 * - Champion progression
 * - Post game availability
 * - Obtainable Pokémon before Brock
 */

"use strict";


const PokemonAvailabilityBuilder =
    require("../scripts/builders/pokemon-availability-builder");


const StarterSelectionService =
    require("../scripts/services/starter-selection-service");









//--------------------------------
// Mock Pokemon Database
//--------------------------------


const pokemonDatabase =
[

    {
        name:"BULBASAUR",
        constant:"SPECIES_BULBASAUR"
    },


    {
        name:"IVYSAUR",
        constant:"SPECIES_IVYSAUR"
    },


    {
        name:"VENUSAUR",
        constant:"SPECIES_VENUSAUR"
    },


    {
        name:"CHARMANDER",
        constant:"SPECIES_CHARMANDER"
    },


    {
        name:"CHARMELEON",
        constant:"SPECIES_CHARMELEON"
    },


    {
        name:"CHARIZARD",
        constant:"SPECIES_CHARIZARD"
    },


    {
        name:"SQUIRTLE",
        constant:"SPECIES_SQUIRTLE"
    },


    {
        name:"WARTORTLE",
        constant:"SPECIES_WARTORTLE"
    },


    {
        name:"BLASTOISE",
        constant:"SPECIES_BLASTOISE"
    },


    {
        name:"PIKACHU",
        constant:"SPECIES_PIKACHU"
    },


    {
        name:"MEWTWO",
        constant:"SPECIES_MEWTWO"
    }

];









//--------------------------------
// Mock encounters
//--------------------------------


const encounters =
[

    {
        species:"PIKACHU",
        location:"VIRIDIAN_FOREST"
    }

];









//--------------------------------
// Mock evolution database
//--------------------------------


const evolutions =
[

    {
        species:"BULBASAUR",

        evolutions:
        [

            {
                target:"SPECIES_IVYSAUR",
                method:"LEVEL",
                level:16
            }

        ]

    },


    {
        species:"IVYSAUR",

        evolutions:
        [

            {
                target:"SPECIES_VENUSAUR",
                method:"LEVEL",
                level:32
            }

        ]

    },


    {
        species:"CHARMANDER",

        evolutions:
        [

            {
                target:"SPECIES_CHARMELEON",
                method:"LEVEL",
                level:16
            }

        ]

    },


    {
        species:"CHARMELEON",

        evolutions:
        [

            {
                target:"SPECIES_CHARIZARD",
                method:"LEVEL",
                level:36
            }

        ]

    },


    {
        species:"SQUIRTLE",

        evolutions:
        [

            {
                target:"SPECIES_WARTORTLE",
                method:"LEVEL",
                level:16
            }

        ]

    },


    {
        species:"WARTORTLE",

        evolutions:
        [

            {
                target:"SPECIES_BLASTOISE",
                method:"LEVEL",
                level:36
            }

        ]

    }

];









//--------------------------------
// Starter Selection
//--------------------------------


const starterSelection =
    new StarterSelectionService();



const playerState =
{

    starter:null,

    ownedPokemon:[]

};




console.log();

console.log(
    "Selecting starter:"
);


console.log(

    starterSelection.selectStarter(

        playerState,

        "CHARMANDER"

    )

);









//--------------------------------
// Build
//--------------------------------


const builder =
    new PokemonAvailabilityBuilder(

        pokemonDatabase,

        encounters,

        evolutions,

        null,

        null,

        starterSelection,

        playerState

    );



const database =
    builder.build();









console.log();

console.log(
    "================================"
);

console.log(
    "Pokemon Availability Builder Tests"
);

console.log(
    "================================"
);









//--------------------------------
// All Pokemon remain
//--------------------------------


console.log();

console.log(
    "Database Pokemon:"
);


console.log(

    database.map(

        pokemon =>

            pokemon.species

    )

);









//--------------------------------
// Starter lines
//--------------------------------


console.log();

console.log(
    "Starter lines:"
);


console.log(

    database

        .filter(

            pokemon =>

                pokemon.availability.starterLine

        )

        .map(

            pokemon =>

                pokemon.species

        )

);









//--------------------------------
// Starter restrictions
//--------------------------------


console.log();

console.log(
    "Starter restriction checks:"
);




const bulbasaur =
    database.find(

        pokemon =>

            pokemon.species === "BULBASAUR"

    );



const charmander =
    database.find(

        pokemon =>

            pokemon.species === "CHARMANDER"

    );



const squirtle =
    database.find(

        pokemon =>

            pokemon.species === "SQUIRTLE"

    );



console.log();


console.log(
    "Bulbasaur:"
);


console.log(

    bulbasaur.starterRestriction

);



console.log();


console.log(
    "Charmander:"
);


console.log(

    charmander.starterRestriction

);



console.log();


console.log(
    "Squirtle:"
);


console.log(

    squirtle.starterRestriction

);









//--------------------------------
// Charmeleon
//--------------------------------


console.log();

console.log(
    "Charmeleon:"
);


console.log(

    database.find(

        pokemon =>

            pokemon.species === "CHARMELEON"

    )

);









//--------------------------------
// Charizard
//--------------------------------


console.log();

console.log(
    "Charizard:"
);


console.log(

    database.find(

        pokemon =>

            pokemon.species === "CHARIZARD"

    )

);









//--------------------------------
// Pikachu
//--------------------------------


console.log();

console.log(
    "Pikachu:"
);


console.log(

    database.find(

        pokemon =>

            pokemon.species === "PIKACHU"

    )

);









//--------------------------------
// Mewtwo
//--------------------------------


console.log();

console.log(
    "Mewtwo:"
);


console.log(

    database.find(

        pokemon =>

            pokemon.species === "MEWTWO"

    ).progression

);









//--------------------------------
// Obtainable before Brock
//--------------------------------


console.log();

console.log(
    "Obtainable before Brock:"
);


console.log(

    builder

        .getObtainableBeforeGym(

            "BROCK"

        )

        .map(

            pokemon =>

                pokemon.species

        )

);









//--------------------------------
// Trade starter test
//--------------------------------


console.log();

console.log(
    "Adding traded Squirtle..."
);



playerState.ownedPokemon.push(

    "SQUIRTLE"

);




const tradedBuilder =

    new PokemonAvailabilityBuilder(

        pokemonDatabase,

        encounters,

        evolutions,

        null,

        null,

        starterSelection,

        playerState

    );




const tradedDatabase =

    tradedBuilder.build();




const tradedSquirtle =

    tradedDatabase.find(

        pokemon =>

            pokemon.species === "SQUIRTLE"

    );




console.log();

console.log(
    "Squirtle after trade:"
);


console.log(

    tradedSquirtle.starterRestriction

);









console.log();

console.log(
    "Pokemon Availability Builder Tests Completed."
);

console.log();