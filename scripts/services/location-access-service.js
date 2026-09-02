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

                    (
                        requirements,
                        connection
                    ) =>
                        this.canTraverseConnection(
                            requirements,
                            connection,
                            playerState
                        )

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
    // Connection traversal
    //--------------------------------


    canTraverseConnection(
        requirements,
        connection,
        playerState
    ) {


        if(
            !requirements
            ||
            requirements.length === 0
        )
        {

            return true;

        }


        if(
            !this.progression
        )
        {

            return false;

        }


        for(
            const requirement of
                requirements
        )
        {


            if(
                !requirement
            )
            {

                continue;

            }


            const progressionRequirement =
                this.convertConnectionRequirement(
                    requirement
                );


            const result =
                this.progression
                    .checkRequirement(
                        progressionRequirement,
                        playerState
                    );


            if(
                !result.allowed
            )
            {

                return false;

            }

        }


        return true;

    }







    //--------------------------------
    // Convert graph connection
    // requirement to progression
    // requirement.
    //--------------------------------


    convertConnectionRequirement(
        requirement
    )
    {


        if(
            typeof requirement ===
                "string"
        )
        {

            return {

                abilities:
                [
                    requirement
                ]

            };

        }


        if(
            !requirement
            ||
            typeof requirement !==
                "object"
        )
        {

            return {

                abilities:
                []

            };

        }


        const type =
            String(

                requirement.type

                ||

                ""

            )
            .toUpperCase();


        if(
            !type
        )
        {

            return {

                abilities:
                []

            };

        }


        //--------------------------------
        // Explicit CAN_USE ability
        //--------------------------------

        if(
            type.startsWith(
                "CAN_USE_"
            )
        )
        {

            return {

                abilities:
                [
                    type
                ]

            };

        }


        //--------------------------------
        // Common field ability names
        //--------------------------------

        const abilityMap =
        {

            CUT:
                "CAN_USE_CUT",

            FLASH:
                "CAN_USE_FLASH",

            SURF:
                "CAN_USE_SURF",

            STRENGTH:
                "CAN_USE_STRENGTH",

            FLY:
                "CAN_USE_FLY",

            ROCK_SMASH:
                "CAN_USE_ROCK_SMASH",

            POKE_FLUTE:
                "CAN_USE_POKE_FLUTE"

        };


        if(
            abilityMap[type]
        )
        {

            return {

                abilities:
                [
                    abilityMap[type]
                ]

            };

        }


        //--------------------------------
        // Generic named requirement
        //--------------------------------

        return {

            abilities:
            [
                type
            ]

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