/**
 * Pokémon Companion
 * Service Container
 *
 * Stores application services.
 *
 * Responsibilities:
 * - Register services.
 * - Retrieve services.
 * - Check service existence.
 *
 * Does NOT:
 * - Create services.
 * - Execute services.
 * - Contain game logic.
 */

"use strict";


class ServiceContainer {


    constructor()
    {

        this.services = {};

    }





    //--------------------------------
    // Register service
    //--------------------------------


    register(
        name,
        service
    )
    {

        this.services[name] =
            service;

    }





    //--------------------------------
    // Retrieve service
    //--------------------------------


    get(
        name
    )
    {

        return (

            this.services[name]

            ||

            null

        );

    }





    //--------------------------------
    // Check existence
    //--------------------------------


    has(
        name
    )
    {

        return Boolean(

            this.services[name]

        );

    }


}


module.exports =
ServiceContainer;