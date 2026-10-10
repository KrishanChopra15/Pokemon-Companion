/**
 * Pokémon Companion
 * Game Session
 *
 * Represents an active Pokémon adventure session.
 *
 * Responsibilities:
 * - Store current game.
 * - Store player state.
 * - Store current location.
 * - Store visited locations.
 * - Store session metadata.
 * - Provide session access.
 *
 * Does NOT:
 * - Execute battles.
 * - Control progression.
 * - Modify Pokémon directly.
 * - Replace trainer services.
 */

"use strict";


const TrainerState =
    require("../domain/trainer-state");


class GameSession {



    constructor(
        game = "firered"
    )
    {


        this.game =
            game;



        this.player =
            null;



        this.trainerState =
            new TrainerState({

                currentLocation:
                    "MAP_PALLET_TOWN",

                visitedLocations:
                    []

            });



        //--------------------------------
        // Attach runtime state to the
        // canonical TrainerState object.
        //--------------------------------

        Object.assign(

            this.trainerState,

            {

                started:
                    false,

                nextPokemonId:
                    1,

                team:
                    [],

                activePokemon:
                    null,

                inventory:
                    this.trainerState.items,

                walkingSteps:
                    0,

                totalSteps:
                    0,

                playTime:
                    0

            }

        );


        //--------------------------------
        // Shared state reference
        //--------------------------------

        this.state =
            this.trainerState;


    }









    //--------------------------------
    // Start session
    //--------------------------------


    start()
    {


        this.state.started =
            true;



        this.markVisited(
            this.state.currentLocation
        );



        return {

            success:true,

            game:
                this.game

        };


    }









    //--------------------------------
    // Player
    //--------------------------------


    setPlayer(
        player
    )
    {


        this.player =
            player;



        return {

            success:true,

            player

        };


    }









    getPlayer()
    {

        return this.player;

    }









    //--------------------------------
    // Location
    //--------------------------------


    setLocation(
        location
    )
    {


        this.state.currentLocation =
            location;



        this.markVisited(
            location
        );



        return {

            success:true,

            location

        };


    }









    getLocation()
    {

        return this.state.currentLocation;

    }









    //--------------------------------
    // Visited Locations
    //--------------------------------


    markVisited(
        location
    )
    {


        if(
            !location
        )
        {

            return false;

        }



        if(
            !this.state.visitedLocations.includes(
                location
            )
        )
        {

            this.state.visitedLocations.push(
                location
            );

        }



        return true;


    }









    hasVisited(
        location
    )
    {


        return this.state.visitedLocations.includes(
            location
        );


    }









    getVisitedLocations()
    {

        return this.state.visitedLocations;

    }









    //--------------------------------
    // State access
    //--------------------------------


    getState()
    {

        return this.state;

    }









    updateState(
        updates
    )
    {


        Object.assign(

            this.state,

            updates

        );



        return this.state;


    }









    //--------------------------------
    // Reset
    //--------------------------------


    reset()
    {


        this.player =
            null;


        //--------------------------------
        // Create fresh adventure state
        //--------------------------------

        this.trainerState =
            new TrainerState({

                currentLocation:
                    "MAP_PALLET_TOWN",

                visitedLocations:
                    []

            });


        //--------------------------------
        // Add runtime session fields
        //--------------------------------

        Object.assign(

            this.trainerState,

            {

                started:
                    false,

                nextPokemonId:
                    1,

                team:
                    [],

                activePokemon:
                    null,

                inventory:
                    this.trainerState.items,

                walkingSteps:
                    0,

                totalSteps:
                    0,

                playTime:
                    0

            }

        );


        //--------------------------------
        // Restore shared state reference
        //--------------------------------

        this.state =
            this.trainerState;


        return {

            success:true

        };


    }



}





module.exports =
    GameSession;