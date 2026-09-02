/**
 * Pokémon Companion
 * Gym Location Service
 *
 * Calculates accessible locations before gyms.
 *
 * Responsibilities:
 * - Combine gym progression and map graph.
 * - Find reachable locations before a gym.
 * - Respect location gates.
 * - Respect progression requirements.
 * - Respect field obstacles.
 *
 * Does NOT:
 * - Analyze Pokémon.
 * - Build databases.
 * - Create progression rules.
 */

"use strict";


class GymLocationService {


    constructor(
        gymProgressionService,
        locationGraphService,
        locationGateService = null,
        fieldObstacleService = null,
        progressionService = null
    ) {


        this.gymProgression =
            gymProgressionService;


        this.locationGraph =
            locationGraphService;


        this.locationGate =
            locationGateService;


        this.fieldObstacle =
            fieldObstacleService;


        this.progression =
            progressionService;


    }



    /**
     * Returns locations accessible
     * before completing a gym.
     */
    getLocationsBeforeGym(
        gymId,
        playerState = {}
    ) {


        const gym =
            this.gymProgression
                .getGym(
                    gymId
                );



        if (!gym) {

            return [];

        }



        const startLocation =
            this.getStartingLocation();



        const visited =
            new Set();



        const queue =
        [
            startLocation
        ];



        while (
            queue.length > 0
        ) {


            const current =
                queue.shift();



            if (
                visited.has(
                    current
                )
            ) {

                continue;

            }



            visited.add(
                current
            );



            const connections =
                this.locationGraph
                    .getConnections(
                        current
                    );



            for (
                const connection of
                    connections
            ) {


                const nextLocation =
                    typeof connection ===
                        "string"
                        ?
                        connection
                        :
                        connection.location;



                const requirements =
                    typeof connection ===
                        "string"
                        ?
                        []
                        :
                        (
                            connection.requirements
                            ||
                            []
                        );



                if (
                    !nextLocation
                ) {

                    continue;

                }



                if (
                    visited.has(
                        nextLocation
                    )
                ) {

                    continue;

                }



                if (
                    !this.canTraverseConnection(
                        requirements,
                        connection,
                        playerState
                    )
                ) {

                    continue;

                }



                if (
                    !this.canEnterLocation(
                        nextLocation,
                        playerState
                    )
                ) {

                    continue;

                }



                queue.push(
                    nextLocation
                );


            }


        }



        return [
            ...visited
        ];

    }




    //--------------------------------
    // Connection requirements
    //--------------------------------


    canTraverseConnection(
        requirements,
        connection,
        playerState = {}
    ) {


        if (
            !requirements
            ||
            requirements.length === 0
        ) {

            return true;

        }



        if (
            !this.progression
        ) {

            return false;

        }



        for (
            const requirement of
                requirements
        ) {


            if (
                !requirement
            ) {

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



            if (
                !result.allowed
            ) {

                return false;

            }


        }



        return true;

    }




    //--------------------------------
    // Convert connection requirement
    //--------------------------------


    convertConnectionRequirement(
        requirement
    ) {


        if (
            typeof requirement ===
                "string"
        ) {

            return {

                abilities:
                [
                    requirement
                ]

            };

        }



        if (
            !requirement
            ||
            typeof requirement !==
                "object"
        ) {

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



        if (
            !type
        ) {

            return {

                abilities:
                []

            };

        }



        //--------------------------------
        // Explicit ability
        //--------------------------------

        if (
            type.startsWith(
                "CAN_USE_"
            )
        ) {

            return {

                abilities:
                [
                    type
                ]

            };

        }



        //--------------------------------
        // Common field abilities
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



        if (
            abilityMap[type]
        ) {

            return {

                abilities:
                [
                    abilityMap[type]
                ]

            };

        }



        return {

            abilities:
            [
                type
            ]

        };

    }




    /**
     * Checks if a location
     * is actually accessible.
     */
    canEnterLocation(
        location,
        playerState = {}
    ) {


        //--------------------------------
        // Location gates
        //--------------------------------

        if (
            this.locationGate
        ) {


            const result =
                this.locationGate
                    .canEnter(
                        location,
                        playerState
                    );



            if (
                !result.allowed
            ) {

                return false;

            }

        }



        //--------------------------------
        // Progression
        //--------------------------------

        if (
            this.progression
        ) {


            const rules =
                this.progression
                    .getLocationProgression(
                        location
                    );



            for (
                const rule of
                    rules
            ) {


                const result =
                    this.progression
                        .canUnlock(
                            rule,
                            playerState
                        );



                if (
                    !result.allowed
                ) {

                    return false;

                }

            }

        }



        //--------------------------------
        // Field obstacles
        //--------------------------------

        if (
            this.fieldObstacle
        ) {


            const obstacles =
                this.fieldObstacle
                    .getObstacles(
                        location
                    );



            for (
                const obstacle of
                    obstacles
            ) {


                const result =
                    this.fieldObstacle
                        .canClearObstacle(
                            location,
                            obstacle.type,
                            playerState
                        );



                if (
                    !result.clearable
                ) {

                    return false;

                }

            }


        }



        return true;

    }




    /**
     * Returns navigation warnings.
     */
    getLocationWarnings(
        locations,
        playerState = {}
    ) {


        if (
            !this.locationGate
        ) {

            return [];

        }



        const warnings = [];



        for (
            const location of locations
        ) {


            const locationWarnings =
                this.locationGate
                    .getWarnings(
                        location,
                        playerState
                    );



            if (
                locationWarnings.length > 0
            ) {


                warnings.push({

                    location,

                    warnings:
                        locationWarnings

                });


            }


        }



        return warnings;

    }




    getStartingLocation() {


        return "MAP_PALLET_TOWN";

    }


}



module.exports = GymLocationService;
