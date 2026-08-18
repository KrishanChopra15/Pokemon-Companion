/**
 * Pokémon Companion
 * World Manager
 *
 * Handles current world state.
 *
 * Responsibilities:
 * - Track current location.
 * - Track visited locations.
 * - Update world state.
 *
 * Does NOT:
 * - Validate movement.
 * - Handle maps.
 * - Handle progression rules.
 */

"use strict";





class WorldManager {



    constructor(
        session
    )
    {

        this.session =
            session;

    }









    //--------------------------------
    // Current location
    //--------------------------------


    getCurrentLocation()
    {

        return this.session
            .getLocation();

    }









    //--------------------------------
    // Move location
    //--------------------------------


    setLocation(
        location
    )
    {


        const result =
            this.session
                .setLocation(
                    location
                );



        if(
            result.success
        )
        {

            this.markVisited(
                location
            );

        }



        return result;


    }









    //--------------------------------
    // Visited locations
    //--------------------------------


    getVisitedLocations()
    {


        if(
            this.session.getVisitedLocations
        )
        {

            return this.session
                .getVisitedLocations();

        }



        const state =
            this.session
                .getState();



        return state.visitedLocations || [];


    }









    //--------------------------------
    // Mark visited
    //--------------------------------


    markVisited(
        location
    )
    {


        if(
            this.session.markVisited
        )
        {

            return this.session
                .markVisited(
                    location
                );

        }




        const state =
            this.session
                .getState();



        if(
            !state.visitedLocations
        )
        {

            state.visitedLocations =
                [];

        }



        if(
            !state.visitedLocations.includes(
                location
            )
        )
        {

            state.visitedLocations.push(
                location
            );

        }



        return true;


    }









    //--------------------------------
    // Has visited
    //--------------------------------


    hasVisited(
        location
    )
    {

        return this.getVisitedLocations()
            .includes(
                location
            );

    }



}





module.exports =
    WorldManager;