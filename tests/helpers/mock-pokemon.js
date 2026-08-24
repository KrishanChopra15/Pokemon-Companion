/**
 * Pokémon Companion
 * Battle Test Mock Pokémon
 */

"use strict";



const {
    ember,
    tackle,
    quickAttack
}
=
require("./mock-moves");









function createCharmander()
{

    return {

        species:
            "CHARMANDER",


        level:
            10,


        hp:
            39,


        maxHP:
            39,


        attack:
            52,


        defense:
            43,


        spAttack:
            60,


        spDefense:
            50,


        speed:
            45,


        type:
        [
            "FIRE"
        ],


        moves:
        [

            {
                ...ember
            },


            {
                ...tackle
            }

        ]

    };

}









function createPikachu()
{

    return {

        species:
            "PIKACHU",


        level:
            12,


        hp:
            40,


        maxHP:
            40,


        attack:
            55,


        defense:
            40,


        spAttack:
            50,


        spDefense:
            50,


        speed:
            90,


        type:
        [
            "ELECTRIC"
        ],


        moves:
        [

            {
                ...tackle
            },


            {
                ...quickAttack
            }

        ]

    };

}









function createGeodude()
{

    return {

        species:
            "GEODUDE",


        level:
            12,


        hp:
            30,


        maxHP:
            30,


        attack:
            80,


        defense:
            100,


        spAttack:
            30,


        spDefense:
            30,


        speed:
            20,


        type:
        [

            "ROCK",

            "GROUND"

        ],


        moves:
        [

            {
                ...tackle
            }

        ]

    };

}









function createOnix()
{

    return {

        species:
            "ONIX",


        level:
            14,


        hp:
            40,


        maxHP:
            40,


        attack:
            45,


        defense:
            160,


        spAttack:
            30,


        spDefense:
            45,


        speed:
            70,


        type:
        [

            "ROCK",

            "GROUND"

        ],


        moves:
        [

            {
                ...tackle
            }

        ]

    };

}









module.exports =
{

    createCharmander,

    createPikachu,

    createGeodude,

    createOnix

};