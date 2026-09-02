/**
 * Pokémon Companion
 * World Flow
 *
 * Coordinates player movement.
 *
 * Responsibilities:
 * - Check location access.
 * - Move player.
 * - Record walking steps.
 * - Apply walking friendship to active party.
 * - Update world state.
 *
 * Does NOT:
 * - Build maps.
 * - Handle battles.
 * - Handle encounters.
 * - Calculate friendship rules.
 */

"use strict";





class WorldFlow {



    constructor(
        worldManager,
        locationAccess = null,
        mapAccess = null,
        teamFlow = null,
        friendshipService = null
    )
    {


        this.world =
            worldManager;


        this.locationAccess =
            locationAccess;


        this.mapAccess =
            mapAccess;


        this.team =
            teamFlow;


        this.friendship =
            friendshipService;


    }









    //--------------------------------
    // Move player
    //--------------------------------


    moveTo(
        location,
        playerState = {}
    )
    {


        //--------------------------------
        // Access validation
        //--------------------------------


        if(
            this.locationAccess
        )
        {


            const access =
                this.locationAccess
                    .analyzeLocation(

                        location,

                        this.world
                            .getCurrentLocation(),

                        playerState

                    );



            if(
                !access.accessible
            )
            {

                return {

                    success:
                        false,

                    reason:
                        "Location inaccessible",

                    details:
                        access

                };

            }


        }








        //--------------------------------
        // Update world state
        //--------------------------------


        const result =
            this.world
                .setLocation(
                    location
                );



        if(
            !result.success
        )
        {

            return {

                success:
                    false,

                reason:
                    "Failed to move",

                details:
                    result

            };

        }








        //--------------------------------
        // Ensure visited tracking
        //--------------------------------


        if(
            this.world.markVisited
        )
        {

            this.world.markVisited(
                location
            );

        }








        return {

            success:
                true,

            location

        };


    }









    //--------------------------------
    // Record walking steps
    //--------------------------------


    recordSteps(
        steps,
        options = {}
    )
    {


        const result =
            this.world
                .addWalkingSteps(
                    steps
                );


        if(
            !result.success
        )
        {

            return result;

        }


        //--------------------------------
        // No completed 128-step interval
        //--------------------------------


        if(
            result.intervals <= 0
        )
        {

            return {

                success:
                    true,

                steps:
                    result,

                friendship:
                    [],

                applied:
                    false

            };

        }


        //--------------------------------
        // Get active party
        //--------------------------------


        if(
            !this.team
            ||
            typeof this.team.getTeam !==
                "function"
        )
        {

            return {

                success:
                    false,

                reason:
                    "Team unavailable",

                steps:
                    result

            };

        }


        const team =
            this.team.getTeam();


        if(
            !Array.isArray(
                team
            )
            ||
            team.length === 0
        )
        {

            return {

                success:
                    true,

                steps:
                    result,

                friendship:
                    [],

                applied:
                    false,

                reason:
                    "No active Pokemon"

            };

        }


        //--------------------------------
        // Friendship service
        //--------------------------------


        if(
            !this.friendship
            ||
            typeof this.friendship.applyWalking !==
                "function"
        )
        {

            return {

                success:
                    false,

                reason:
                    "Friendship service unavailable",

                steps:
                    result

            };

        }


        //--------------------------------
        // Apply walking friendship
        //
        // applyWalking() expects a number
        // of steps and performs one random
        // check for each 128-step interval.
        //--------------------------------


        const friendshipResults =
            [];


        for(
            const pokemon of team
        )
        {

            const friendshipResult =
                this.friendship.applyWalking(

                    pokemon,

                    {

                        steps:
                            result.intervals *
                            128,

                        ...options

                    }

                );


            friendshipResults.push(

                {

                    species:
                        pokemon.species,

                    ...friendshipResult

                }

            );

        }


        return {

            success:
                true,

            steps:
                result,

            friendship:
                friendshipResults,

            applied:
                true

        };

    }









    //--------------------------------
    // Get current walking steps
    //--------------------------------


    getWalkingSteps()
    {

        return this.world
            .getWalkingSteps();

    }









    //--------------------------------
    // Get total steps
    //--------------------------------


    getTotalSteps()
    {

        return this.world
            .getTotalSteps();

    }









    //--------------------------------
    // Status
    //--------------------------------


    getWorldStatus()
    {


        return {

            current:

                this.world
                    .getCurrentLocation(),


            visited:

                this.world
                    .getVisitedLocations(),


            walkingSteps:

                this.world
                    .getWalkingSteps(),


            totalSteps:

                this.world
                    .getTotalSteps()

        };


    }



}





module.exports =
    WorldFlow;