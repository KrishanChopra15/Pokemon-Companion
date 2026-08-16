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



        const reachable =
            this.locationGraph
                .isReachable(
                    startLocation,
                    location,
                    playerState
                );




        const gate =
            this.checkLocationGate(
                location,
                playerState
            );




        const progression =
            this.checkProgression(
                location,
                playerState
            );




        const obstacles =
            this.getObstacleStatus(
                location,
                playerState
            );




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







    //--------------------------------
    // Gates
    //--------------------------------


    checkLocationGate(
        location,
        playerState
    ) {


        if(
            !this.locationGate
        ) {


            return {

                allowed:true,

                reason:null

            };


        }



        return this.locationGate
            .canEnter(
                location,
                playerState
            );


    }







    //--------------------------------
    // Progression
    //--------------------------------


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



        const rules =
            this.progression
                .getLocationProgression(
                    location
                );



        if(
            !rules ||
            rules.length === 0
        ) {


            return {


                allowed:true,


                reason:null


            };


        }





        for(
            const rule of rules
        ) {



            const result =
                this.progression
                    .canUnlock(
                        rule,
                        playerState
                    );



            if(
                result.allowed
            ) {


                return result;


            }


        }





        return {


            allowed:false,


            reason:
                "Progression requirement not met"


        };


    }







    //--------------------------------
    // Obstacles
    //--------------------------------


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



module.exports =
    LocationAccessService;