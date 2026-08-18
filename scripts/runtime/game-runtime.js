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
 * - Coordinate world movement.
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



        this.saveManager =
            this.container.get(
                "saveManager"
            );



        this.worldFlow =
            this.container.get(
                "worldFlow"
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
    // World Location
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


        const result =
            this.worldFlow
                .moveTo(
                    location,
                    this.session.getState()
                );



        if(
            result.success
        )
        {


            this.session.setLocation(
                location
            );


        }



        return result;


    }









    getVisitedLocations()
    {


        return this.session
            .getVisitedLocations();


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


            visited:

                this.session.getVisitedLocations(),


            started:

                this.session.getState()
                    .started


        };


    }









    //--------------------------------
    // Save
    //--------------------------------


    saveGame()
    {

        return this.saveManager
            .createSave(
                this.session
            );

    }









    loadGame(
        id
    )
    {

        return this.saveManager
            .loadSave(
                id,
                this.session
            );

    }



}





module.exports =
    GameRuntime;