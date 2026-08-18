/**
 * Pokémon Companion
 * World Flow
 *
 * Coordinates player movement.
 *
 * Responsibilities:
 * - Check location access.
 * - Move player.
 * - Update world state.
 *
 * Does NOT:
 * - Build maps.
 * - Handle battles.
 * - Handle encounters.
 */

"use strict";





class WorldFlow {



    constructor(
        worldManager,
        locationAccess = null,
        mapAccess = null
    )
    {


        this.world =
            worldManager;


        this.locationAccess =
            locationAccess;


        this.mapAccess =
            mapAccess;


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

                    success:false,

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

                success:false,

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

            success:true,

            location

        };


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
                    .getVisitedLocations()


        };


    }



}





module.exports =
    WorldFlow;