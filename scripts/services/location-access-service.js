/**
 * Pokémon Companion
 * Location Access Service
 *
 * Combines:
 * - Location traversal
 * - Location gates
 * - Field obstacles
 * - Progression rules
 *
 * Does NOT:
 * - Build graphs.
 * - Parse maps.
 * - Create progression rules.
 */

"use strict";


class LocationAccessService {


    constructor(
        locationGraphService,
        fieldObstacleService,
        locationGateService = null,
        progressionService = null
    ) {


        this.locationGraph =
            locationGraphService;


        this.fieldObstacle =
            fieldObstacleService;


        this.locationGate =
            locationGateService;


        this.progression =
            progressionService;


    }





    analyzeLocation(
        location,
        startLocation,
        playerState = {}
    ) {



        //--------------------------------
        // Physical graph reachability
        //--------------------------------

        const reachable =
            this.locationGraph
                .isReachable(
                    startLocation,
                    location,
                    playerState
                );




        //--------------------------------
        // Gate checks
        //--------------------------------

        const gate =
            this.checkLocationGate(
                location,
                playerState
            );




        //--------------------------------
        // Progression checks
        //--------------------------------

        const progression =
            this.checkProgression(
                location,
                playerState
            );




        //--------------------------------
        // Internal obstacles
        //--------------------------------

        const obstacles =
            this.getObstacleStatus(
                location,
                playerState
            );




        //--------------------------------
        // Final accessibility
        //--------------------------------

        const accessible =
            reachable
            &&
            gate.allowed
            &&
            progression.allowed;




        return {

            location,

            reachable,

            accessible,

            gate,

            progression,

            obstacles

        };


    }





    checkLocationGate(
        location,
        playerState
    ) {


        if(
            !this.locationGate
        ) {


            return {

                allowed:true

            };


        }



        return this.locationGate
            .canEnter(
                location,
                playerState
            );


    }





    checkProgression(
        location,
        playerState
    ) {


        if(
            !this.progression
        ) {


            return {

                allowed:true,

                reason:null

            };


        }



        return this.progression
            .canAccessLocation(
                location,
                playerState
            );


    }





    getObstacleStatus(
        location,
        playerState
    ) {


        return this.fieldObstacle
            .getObstacles(
                location
            )
            .map(
                obstacle => {


                    const result =
                        this.fieldObstacle
                            .canClearObstacle(
                                location,
                                obstacle.type,
                                playerState
                            );



                    return {

                        type:
                            obstacle.type,


                        cleared:
                            result.clearable,


                        requirement:
                            result.requirement
                            ||
                            null,


                        x:
                            obstacle.x,


                        y:
                            obstacle.y


                    };


                }
            );


    }





    getBlockedObstacles(
        location,
        playerState = {}
    ) {


        return this.fieldObstacle
            .getObstacles(
                location
            )
            .filter(
                obstacle => {


                    const result =
                        this.fieldObstacle
                            .canClearObstacle(
                                location,
                                obstacle.type,
                                playerState
                            );


                    return !result.clearable;


                }
            );


    }


}


module.exports = LocationAccessService;