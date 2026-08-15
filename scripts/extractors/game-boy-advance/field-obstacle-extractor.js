/**
 * Pokémon Companion
 * Field Obstacle Extractor
 *
 * Extracts obstacles inside locations.
 *
 * Examples:
 * - CUT trees
 * - ROCK_SMASH rocks
 *
 * Does NOT:
 * - Decide location access.
 * - Handle progression.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class FieldObstacleExtractor {


    extract(sourcePath) {


        const mapsPath =
            path.join(
                sourcePath,
                "data",
                "maps"
            );


        const obstacles = {};



        const maps =
            fs.readdirSync(
                mapsPath
            );



        for (const map of maps) {


            const mapFile =
                path.join(
                    mapsPath,
                    map,
                    "map.json"
                );


            if (!fs.existsSync(mapFile)) {

                continue;

            }



            const data =
                JSON.parse(
                    fs.readFileSync(
                        mapFile,
                        "utf8"
                    )
                );



            if (!data.id) {

                continue;

            }



            if (!data.object_events) {

                continue;

            }



            const locationObstacles = [];



            for (const object of data.object_events) {


                let type = null;



                switch(object.graphics_id) {


                    case "OBJ_EVENT_GFX_CUT_TREE":

                        type = "CUT";

                        break;



                    case "OBJ_EVENT_GFX_ROCK_SMASH_ROCK":

                        type = "ROCK_SMASH";

                        break;


                }



                if (!type) {

                    continue;

                }



                locationObstacles.push({

                    type,


                    graphics:
                        object.graphics_id,


                    script:
                        object.script || null,


                    x:
                        object.x,


                    y:
                        object.y,


                    elevation:
                        object.elevation || 0


                });


            }



            if (locationObstacles.length > 0) {


                obstacles[data.id] =
                    locationObstacles;


            }


        }



        return obstacles;


    }


}


module.exports = FieldObstacleExtractor;