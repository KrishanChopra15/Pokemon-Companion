/**
 * Pokémon Companion
 * Battle Test Mock Battles
 */

"use strict";





const {

    createCharmander,

    createPikachu,

    createGeodude,

    createOnix

}
=
require("./mock-pokemon");









function createBattle()
{

    return {

        id:
            "BATTLE_TEST_1",


        player:
        {

            party:
            [

                createCharmander(),

                createPikachu()

            ]

        },


        opponent:
        {

            party:
            [

                createGeodude(),

                createOnix()

            ]

        }

    };

}









function createSpeedBattle()
{

    const player =
        createPikachu();


    player.level = 20;





    const enemy =
        createGeodude();


    enemy.level = 20;





    enemy.speed = 20;





    return {

        id:
            "SPEED_TEST",


        player:
        {

            party:
            [

                player

            ]

        },


        opponent:
        {

            party:
            [

                enemy

            ]

        }

    };

}









function createStruggleBattle()
{

    const battle =
        createBattle();





    battle.id =
        "STRUGGLE_TEST";





    battle.player.party[0].moves[0].pp = 0;





    return battle;

}









module.exports =
{

    createBattle,

    createSpeedBattle,

    createStruggleBattle

};