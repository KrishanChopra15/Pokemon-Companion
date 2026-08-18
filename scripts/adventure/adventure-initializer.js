/**
 * Pokémon Companion
 * Adventure Initializer
 *
 * Creates a new Pokémon adventure.
 *
 * Responsibilities:
 * - Initialize player.
 * - Select starter.
 * - Initialize session.
 * - Initialize world state.
 *
 * Does NOT:
 * - Execute battles.
 * - Handle progression.
 * - Manage saves.
 */

"use strict";





class AdventureInitializer {



    constructor(
        playerFlow,
        session,
        worldState = null
    )
    {


        this.playerFlow =
            playerFlow;


        this.session =
            session;


        this.worldState =
            worldState;


    }









    //--------------------------------
    // Start adventure
    //--------------------------------


    startAdventure(
        playerName,
        starter
    )
    {


        const playerResult =
            this.playerFlow
                .createPlayer(
                    playerName
                );



        if(
            !playerResult.success
        )
        {

            return playerResult;

        }








        const starterResult =
            this.playerFlow
                .chooseStarter(
                    starter
                );



        if(
            !starterResult.success
        )
        {

            return starterResult;

        }








        this.session.start();



        this.session.setLocation(
            "PALLET_TOWN"
        );








        if(
            this.worldState
        )
        {

            this.worldState.reset();

        }








        return {

            success:true,


            player:

                this.playerFlow
                    .getPlayer(),


            starter:

                this.playerFlow
                    .getStarter(),


            location:

                this.session
                    .getLocation()


        };


    }



}





module.exports =
    AdventureInitializer;