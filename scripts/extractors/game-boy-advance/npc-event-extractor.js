/**
 * Pokémon Companion
 * NPC Event Extractor
 *
 * Extracts NPC objects from maps.
 *
 * Responsibilities:
 * - Read map object events.
 * - Extract NPC positions.
 * - Extract linked scripts.
 *
 * Does NOT:
 * - Decide event logic.
 * - Handle choices.
 * - Handle progression.
 */

"use strict";

const fs = require("fs");
const path = require("path");



class NPCEventExtractor {


    extract(sourcePath) {


        const mapsPath =
            path.join(
                sourcePath,
                "data",
                "maps"
            );


        const npcs = {};



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



            if (
                !data.id ||
                !data.object_events
            ) {

                continue;

            }



            const locationNPCs = [];



            for (const object of data.object_events) {



                //--------------------------------
                // Must have script
                //--------------------------------

                if (
                    !object.script
                ) {

                    continue;

                }



                //--------------------------------
                // Ignore static objects
                //--------------------------------

                if (
                    object.graphics_id === "0"
                ) {

                    continue;

                }



                //--------------------------------
                // Ignore hidden objects
                //--------------------------------

                if (
                    object.graphics_id === null
                ) {

                    continue;

                }



                locationNPCs.push({

                    graphics:
                        object.graphics_id,


                    script:
                        object.script,


                    position:{

                        x:
                            object.x,


                        y:
                            object.y,


                        elevation:
                            object.elevation || 0

                    }


                });


            }



            if (
                locationNPCs.length > 0
            ) {


                npcs[data.id] =
                    locationNPCs;


            }


        }



        return npcs;


    }


}


module.exports = NPCEventExtractor;