/**
 * Pokémon Companion
 * Game Runtime
 *
 * Coordinates active game execution.
 *
 * Responsibilities:
 * - Start game sessions.
 * - Access active session.
 * - Access application services.
 * - Provide high-level game operations.
 *
 * Does NOT:
 * - Execute battles.
 * - Handle progression rules.
 * - Modify databases.
 * - Replace services.
 */

"use strict";





class GameRuntime {



    constructor(
        appContainer
    )
    {


        this.container =
            appContainer;



        this.session =
            this.container.get(
                "session"
            );


    }









    //--------------------------------
    // Start game
    //--------------------------------


    start()
    {


        return this.session.start();


    }









    //--------------------------------
    // Session access
    //--------------------------------


    getSession()
    {

        return this.session;

    }









    //--------------------------------
    // Player access
    //--------------------------------


    setPlayer(
        player
    )
    {


        return this.session
            .setPlayer(
                player
            );


    }









    getPlayer()
    {

        return this.session
            .getPlayer();

    }









    //--------------------------------
    // Location
    //--------------------------------


    getCurrentLocation()
    {

        return this.session
            .getLocation();

    }









    moveTo(
        location
    )
    {


        return this.session
            .setLocation(
                location
            );


    }









    //--------------------------------
    // Service access
    //--------------------------------


    getService(
        name
    )
    {


        return this.container
            .get(
                name
            );


    }









    //--------------------------------
    // Runtime info
    //--------------------------------


    getInfo()
    {


        return {


            game:

                this.session.game,


            location:

                this.session.getLocation(),


            started:

                this.session.getState()
                    .started


        };


    }



}





module.exports =
    GameRuntime;