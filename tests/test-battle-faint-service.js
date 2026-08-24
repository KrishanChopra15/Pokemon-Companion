/**
 * Pokémon Companion
 * Battle Faint Service Test
 *
 * Tests:
 * - Detect fainted Pokémon
 * - Create faint event
 * - Prevent duplicate faint logs
 * - Auto switch Pokémon
 * - No switch available
 */

"use strict";


const BattleFaintService =
    require("../scripts/services/battle-faint-service");









//--------------------------------
// Mock switch service
//--------------------------------


const pokemonSwitchService =
{

    autoSwitch(side)
    {


        const nextIndex =

            side.party.findIndex(

                (pokemon, index) =>

                    index !== side.active

                    &&

                    pokemon.hp > 0

            );





        if(
            nextIndex === -1
        )
        {

            return {

                success:false

            };

        }





        return {

            success:true,


            index:
                nextIndex,


            pokemon:
                side.party[nextIndex]

        };


    }

};









//--------------------------------
// Mock Pokemon service
//--------------------------------


const pokemonService =
{

    getActivePokemon(side)
    {


        if(
            !side
            ||
            !side.party
        )
        {

            return null;

        }





        return side.party[

            side.active !== undefined

            ?

            side.active

            :

            0

        ];

    }

};









const faintService =

    new BattleFaintService(

        pokemonService,

        pokemonSwitchService

    );









console.log();

console.log(
"================================"
);

console.log(
"Battle Faint Service Tests"
);

console.log(
"================================"
);









//--------------------------------
// Test battle side
//--------------------------------


const battleSide =
{

    active:
        0,


    party:
    [

        {

            species:
                "CHARMANDER",


            hp:
                0

        },


        {

            species:
                "PIKACHU",


            hp:
                40

        }

    ]

};









//--------------------------------
// Faint detection + auto switch
//--------------------------------


console.log();

console.log(
"Faint detection:"
);



const result =
{

    actions:
        []

};









const faintHandled =

    faintService.handleFaint(

        battleSide,

        result

    );









console.log(

    {

        handled:
            faintHandled,


        active:
            battleSide.active,


        activePokemon:
            battleSide.party[

                battleSide.active

            ].species

    }

);









console.log(

    JSON.stringify(

        result,

        null,

        4

    )

);









//--------------------------------
// Duplicate faint test
//--------------------------------


console.log();

console.log(
"Duplicate faint test:"
);



const duplicateResult =
{

    actions:
    [

        {

            type:
                "FAINT",


            pokemon:
                "CHARMANDER"

        }

    ]

};









const duplicateHandled =

    faintService.handleFaint(

        battleSide,

        duplicateResult

    );









console.log(

    {

        handled:
            duplicateHandled,


        actions:
            duplicateResult.actions

    }

);









//--------------------------------
// No switch available
//--------------------------------


console.log();

console.log(
"No switch available:"
);









const emptySide =
{

    active:
        0,


    party:
    [

        {

            species:
                "GEODUDE",


            hp:
                0

        }

    ]

};









const emptyResult =
{

    actions:
        []

};









const noSwitch =

    faintService.handleFaint(

        emptySide,

        emptyResult

    );









console.log(

    {

        handled:
            noSwitch,


        actions:
            emptyResult.actions

    }

);









console.log();

console.log(
"================================"
);

console.log(
"Battle Faint Service Tests Completed."
);

console.log(
"================================"
);

console.log();