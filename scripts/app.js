/**
 * Pokémon Companion
 * Application Bootstrap
 *
 * Starts the application.
 *
 * Responsibilities:
 * - Create application container.
 * - Initialize selected game.
 * - Expose application services.
 *
 * Does NOT:
 * - Execute game logic.
 * - Handle battles.
 * - Modify trainer state.
 * - Handle requests.
 */

"use strict";


//================================
// Application Container
//================================

const AppContainer =
    require("./app-container");





class Application {



    constructor(
        game = "firered"
    )
    {


        this.game =
            game;



        this.container =
            new AppContainer(
                game
            );


    }






    //--------------------------------
    // Get service
    //--------------------------------


    get(
        name
    )
    {

        return this.container.get(
            name
        );

    }







    //--------------------------------
    // Get container
    //--------------------------------


    getContainer()
    {

        return this.container;

    }







    //--------------------------------
    // Application info
    //--------------------------------


    getInfo()
    {

        return {

            name:
                "Pokémon Companion",


            game:
                this.game


        };

    }



}






module.exports =
    Application;