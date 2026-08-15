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
 * - Respect field obstacles.
 *
 * Does NOT:
 * - Analyze Pokémon.
 * - Build databases.
 * - Handle complete progression rules.
 */

"use strict";


class GymLocationService {


    constructor(
        gymProgressionService,
        locationGraphService,
        locationGateService = null,
        fieldObstacleService = null
    ) {


        this.gymProgression =
            gymProgressionService;


        this.locationGraph =
            locationGraphService;


        this.locationGate =
            locationGateService;


        this.fieldObstacle =
            fieldObstacleService;


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
                const next of connections
            ) {


                if (
                    visited.has(
                        next
                    )
                ) {

                    continue;

                }



                if (
                    this.canEnterLocation(
                        next,
                        playerState
                    )
                ) {


                    queue.push(
                        next
                    );


                }


            }


        }



        return [
            ...visited
        ];

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



            const moves =
                playerState.moves || [];



            for (
                const obstacle of obstacles
            ) {


                if (
                    !moves.includes(
                        obstacle.type
                    )
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