/**
 * Pokémon Companion
 * Location Gate Service
 *
 * Checks location access requirements.
 *
 * Responsibilities:
 * - Load location gates.
 * - Validate hard requirements.
 * - Provide soft requirement warnings.
 * - Use progression rules.
 *
 * Does NOT:
 * - Handle field obstacles.
 * - Traverse maps.
 * - Build graphs.
 * - Handle internal objects.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationGateService {


    constructor(
        game,
        progressionService = null
    ) {


        const generatedPath =
            path.join(
                __dirname,
                "../../database/generated",
                game
            );


        this.progression =
            progressionService;



        //--------------------------------
        // Load locations
        //--------------------------------

        this.locations =
            JSON.parse(
                fs.readFileSync(
                    path.join(
                        generatedPath,
                        "locations.json"
                    ),
                    "utf8"
                )
            );


    }





    getGate(
        location
    ) {


        const data =
            this.locations[location];



        const soft =
            data && data.gates
                ? [
                    ...(data.gates.soft || [])
                ]
                : [];



        const hard =
            data && data.gates
                ? [
                    ...(data.gates.hard || [])
                ]
                : [];



        return {

            soft,

            hard

        };


    }





    canEnter(
        location,
        playerState = {}
    ) {


        const gates =
            this.getGate(
                location
            );



        for (
            const gate of gates.hard
        ) {


            const result =
                this.hasRequirement(
                    gate,
                    playerState
                );



            if (
                !result.allowed
            ) {


                return {

                    allowed:false,

                    type:"hard",

                    requirement:
                        gate.type,

                    reason:
                        result.reason

                };


            }


        }



        return {

            allowed:true

        };


    }





    getWarnings(
        location,
        playerState = {}
    ) {


        const warnings = [];


        const gates =
            this.getGate(
                location
            );



        for (
            const gate of gates.soft
        ) {


            const result =
                this.hasRequirement(
                    gate,
                    playerState
                );



            if (
                !result.allowed
            ) {


                warnings.push({

                    type:
                        gate.type,


                    reason:
                        gate.reason
                        ||
                        result.reason

                });


            }


        }



        return warnings;


    }





    hasRequirement(
        gate,
        playerState
    ) {


        //--------------------------------
        // HM progression
        //--------------------------------

        if (
            this.progression
        ) {


            const hmList = [

                "CUT",
                "FLASH",
                "SURF",
                "STRENGTH",
                "FLY",
                "ROCK_SMASH"

            ];



            if (
                hmList.includes(
                    gate.type
                )
            ) {


                return this.progression
                    .canUseHM(
                        gate.type,
                        playerState
                    );


            }


        }



        //--------------------------------
        // Direct state fallback
        //--------------------------------

        const values = [

            ...(playerState.hms || []),

            ...(playerState.moves || []),

            ...(playerState.keyItems || []),

            ...(playerState.storyFlags || []),

            ...(playerState.badges || [])

        ];



        if (
            values.includes(
                gate.type
            )
        ) {


            return {

                allowed:true

            };


        }



        return {

            allowed:false,

            reason:
                `Requires ${gate.type}`

        };


    }


}


module.exports = LocationGateService;