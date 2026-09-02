/**
 * Pokémon Companion
 * World Manager
 *
 * Handles current world state.
 *
 * Responsibilities:
 * - Track current location.
 * - Track visited locations.
 * - Track walking steps.
 * - Update world state.
 *
 * Does NOT:
 * - Validate movement.
 * - Handle maps.
 * - Handle progression rules.
 * - Execute friendship mechanics.
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









    //--------------------------------
    // Get walking steps
    //--------------------------------


    getWalkingSteps()
    {

        const state =
            this.session
                .getState();


        return Number(
            state.walkingSteps
        )
        ||
        0;

    }









    //--------------------------------
    // Get total steps
    //--------------------------------


    getTotalSteps()
    {

        const state =
            this.session
                .getState();


        return Number(
            state.totalSteps
        )
        ||
        0;

    }









    //--------------------------------
    // Add walking steps
    //--------------------------------


    addWalkingSteps(
        steps
    )
    {


        const amount =
            Number(
                steps
            );


        if(
            !Number.isFinite(
                amount
            )
            ||
            amount <= 0
        )
        {

            return {

                success:
                    false,

                reason:
                    "Invalid step count"

            };

        }


        const state =
            this.session
                .getState();


        const previousWalkingSteps =
            Number(
                state.walkingSteps
            )
            ||
            0;


        const previousTotalSteps =
            Number(
                state.totalSteps
            )
            ||
            0;


        const totalWalkingSteps =
            previousWalkingSteps +
            Math.floor(
                amount
            );


        const intervals =
            Math.floor(

                totalWalkingSteps /
                128

            );


        const remainingSteps =
            totalWalkingSteps %
            128;


        state.walkingSteps =
            remainingSteps;


        state.totalSteps =
            previousTotalSteps +
            Math.floor(
                amount
            );


        return {

            success:
                true,

            added:
                Math.floor(
                    amount
                ),

            previousWalkingSteps,

            walkingSteps:
                remainingSteps,

            totalSteps:
                state.totalSteps,

            intervals

        };

    }



}





module.exports =
    WorldManager;