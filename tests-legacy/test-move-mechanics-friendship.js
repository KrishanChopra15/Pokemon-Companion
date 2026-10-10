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
"Friendship Move Mechanics Test"
);

console.log(
"==============================="
);









//================================
// Return
//================================


const returnMove =
{

    constant:
        "MOVE_RETURN"

};





const highFriendshipPokemon =
{

    species:
        "Pikachu",

    friendship:
        255

};





console.log();


console.log(
"Return High Friendship:"
);



console.log(

    service.resolveMove(

        returnMove,

        {

            pokemon:
                highFriendshipPokemon

        }

    )

);









//================================
// Frustration
//================================


const frustrationMove =
{

    constant:
        "MOVE_FRUSTRATION"

};





const lowFriendshipPokemon =
{

    species:
        "Pikachu",

    friendship:
        0

};





console.log();


console.log(
"Frustration Low Friendship:"
);



console.log(

    service.resolveMove(

        frustrationMove,

        {

            pokemon:
                lowFriendshipPokemon

        }

    )

);









//================================
// Middle Friendship
//================================


const normalPokemon =
{

    species:
        "Eevee",

    friendship:
        128

};





console.log();


console.log(
"Return Medium Friendship:"
);



console.log(

    service.resolveMove(

        returnMove,

        {

            pokemon:
                normalPokemon

        }

    )

);






console.log();


console.log(
"Frustration Medium Friendship:"
);



console.log(

    service.resolveMove(

        frustrationMove,

        {

            pokemon:
                normalPokemon

        }

    )

);









console.log();


console.log(
"Completed."
);