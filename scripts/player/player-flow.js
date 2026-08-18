/**
 * Pokémon Companion
 * Player Flow
 *
 * Coordinates player setup flow.
 *
 * Responsibilities:
 * - Create player.
 * - Select starter.
 * - Update session.
 *
 * Does NOT:
 * - Handle battles.
 * - Handle progression.
 * - Manage Pokémon teams.
 */

"use strict";





class PlayerFlow {



    constructor(
        playerManager,
        starterSelection,
        session
    )
    {


        this.playerManager =
            playerManager;


        this.starterSelection =
            starterSelection;


        this.session =
            session;


    }









    //--------------------------------
    // Create player
    //--------------------------------


    createPlayer(
        name
    )
    {


        const result =
            this.playerManager
                .createPlayer(
                    name
                );



        if(
            !result.success
        )
        {

            return result;

        }








        this.playerManager
            .attachToSession(

                this.session,

                result.player

            );








        return result;


    }









    //--------------------------------
    // Select starter
    //--------------------------------


    chooseStarter(
        starter
    )
    {


        const player =
            this.session
                .getPlayer();



        if(
            !player
        )
        {

            return {

                success:false,

                reason:
                    "No player created"

            };

        }








        const result =
            this.starterSelection
                .selectStarter(

                    player.trainerState,

                    starter

                );



        if(
            result.success
        )
        {

            player.starter =
                starter;


        }








        return result;


    }









    //--------------------------------
    // Get player
    //--------------------------------


    getPlayer()
    {

        return this.session
            .getPlayer();

    }









    //--------------------------------
    // Get starter
    //--------------------------------


    getStarter()
    {


        const player =
            this.getPlayer();



        return player

            ?

            player.starter

            :

            null;


    }



}





module.exports =
    PlayerFlow;