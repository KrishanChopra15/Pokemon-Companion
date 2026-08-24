/**
 * Pokémon Companion
 * Battle Test Mock Moves
 */

"use strict";





const ember =
{

    name:
        "EMBER",


    constant:
        "MOVE_EMBER",


    type:
        "FIRE",


    category:
        "SPECIAL",


    power:
        40,


    accuracy:
        100,


    pp:
        25,


    maxPP:
        25,


    priority:
        0,


    effect:
    {

        type:
            "BURN",


        chance:
            10

    }

};









const tackle =
{

    name:
        "TACKLE",


    constant:
        "MOVE_TACKLE",


    type:
        "NORMAL",


    category:
        "PHYSICAL",


    power:
        35,


    accuracy:
        95,


    pp:
        35,


    maxPP:
        35,


    priority:
        0

};









const quickAttack =
{

    name:
        "QUICK_ATTACK",


    constant:
        "MOVE_QUICK_ATTACK",


    type:
        "NORMAL",


    category:
        "PHYSICAL",


    power:
        40,


    accuracy:
        100,


    pp:
        30,


    maxPP:
        30,


    priority:
        1

};









module.exports =
{

    ember,

    tackle,

    quickAttack

};