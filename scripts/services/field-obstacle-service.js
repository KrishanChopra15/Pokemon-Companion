/**
 * Pokémon Companion
 * Field Obstacle Service
 *
 * Provides internal location obstacles.
 *
 * Responsibilities:
 * - Load field obstacle database.
 * - Find obstacles inside locations.
 * - Check obstacle existence.
 * - Check if player can clear obstacles.
 *
 * Does NOT:
 * - Control map access.
 * - Build graphs.
 * - Handle story progression.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class FieldObstacleService {


    constructor(game, progressionService = null) {


        const file =
            path.join(
                __dirname,
                "../../database/raw",
                game,
                "field-obstacles.json"
            );


        this.obstacles =
            JSON.parse(
                fs.readFileSync(
                    file,
                    "utf8"
                )
            );


        this.progression =
            progressionService;


    }





    getObstacles(location) {


        return (
            this.obstacles[location]
            ||
            []
        );


    }





    hasObstacle(
        location,
        type
    ) {


        return this
            .getObstacles(location)
            .some(
                obstacle =>
                    obstacle.type === type
            );


    }





    /**
     * Checks if obstacle can be cleared.
     *
     * Requires:
     *
     * HM
     * +
     * Badge permission
     *
     */
    canClearObstacle(
        location,
        obstacle,
        playerState = {}
    ) {


        const required =
            typeof obstacle === "string"
                ? obstacle
                : obstacle?.type;



        if(!required)
        {

            return {

                exists:false,

                clearable:true

            };

        }



        const exists =
            this.hasObstacle(
                location,
                required
            );



        if(!exists)
        {

            return {

                exists:false,

                clearable:true

            };

        }




        //--------------------------------
        // Use progression rules
        //--------------------------------

        if(this.progression)
        {


            const result =
                this.progression
                    .canUseHM(
                        required,
                        playerState
                    );



            return {

                exists:true,

                clearable:
                    result.allowed,


                requirement:
                    required,


                reason:
                    result.reason || null

            };


        }




        //--------------------------------
        // Fallback
        //--------------------------------

        const hms =
            playerState.hms
            ||
            playerState.moves
            ||
            [];



        return {

            exists:true,

            clearable:
                hms.includes(
                    required
                ),


            requirement:
                required

        };


    }





    canClearObstacleType(
        location,
        type,
        playerState = {}
    ) {


        return this.canClearObstacle(
            location,
            type,
            playerState
        );


    }





    getBlockedObstacles(
        location,
        playerState = {}
    ) {


        return this
            .getObstacles(
                location
            )
            .filter(
                obstacle =>
                    !this.canClearObstacle(
                        location,
                        obstacle,
                        playerState
                    )
                    .clearable
            );


    }





    getAllObstacles() {


        return this.obstacles;


    }


}


module.exports = FieldObstacleService;