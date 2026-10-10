"use strict";


const MoveMechanicsService =
    require("../scripts/services/move-mechanics-service");





const service =
    new MoveMechanicsService(
        "firered"
    );







console.log();


console.log(
"==============================="
);

console.log(
"Hidden Power Move Mechanics Test"
);

console.log(
"==============================="
);









//================================
// Hidden Power Move
//================================


const hiddenPower =
{

    constant:
        "MOVE_HIDDEN_POWER"

};









//================================
// Perfect IV Pokémon
//================================


const perfectIVPokemon =
{

    species:
        "Mew",


    ivs:
    {

        hp:
            31,


        attack:
            31,


        defense:
            31,


        speed:
            31,


        spAttack:
            31,


        spDefense:
            31

    }


};









console.log();


console.log(
"Perfect IV Pokémon:"
);



console.log(

    service.resolveMove(

        hiddenPower,

        {

            pokemon:
                perfectIVPokemon

        }

    )

);









//================================
// Zero IV Pokémon
//================================


const zeroIVPokemon =
{

    species:
        "Unown",


    ivs:
    {

        hp:
            0,


        attack:
            0,


        defense:
            0,


        speed:
            0,


        spAttack:
            0,


        spDefense:
            0

    }


};









console.log();


console.log(
"Zero IV Pokémon:"
);



console.log(

    service.resolveMove(

        hiddenPower,

        {

            pokemon:
                zeroIVPokemon

        }

    )

);









//================================
// Example Mixed IV Pokémon
//================================


const mixedIVPokemon =
{

    species:
        "Pikachu",


    ivs:
    {

        hp:
            31,


        attack:
            30,


        defense:
            31,


        speed:
            30,


        spAttack:
            31,


        spDefense:
            30

    }


};









console.log();


console.log(
"Mixed IV Pokémon:"
);



console.log(

    service.resolveMove(

        hiddenPower,

        {

            pokemon:
                mixedIVPokemon

        }

    )

);









//================================
// Direct Calculation Tests
//================================


console.log();


console.log(
"Hidden Power Type:"
);



console.log(

    service.calculateHiddenPowerType(

        perfectIVPokemon

    )

);





console.log();


console.log(
"Hidden Power Power:"
);



console.log(

    service.calculateHiddenPowerPower(

        perfectIVPokemon

    )

);









console.log();


console.log(
"Completed."
);