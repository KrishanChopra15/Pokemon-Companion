/**
 * Pokémon Companion
 * Location Gate Extractor
 *
 * Extracts location access gates.
 *
 * Responsibilities:
 * - Read map.json files.
 * - Extract movement/access requirements.
 *
 * Does NOT:
 * - Generate databases.
 * - Handle player progression.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationGateExtractor {


    extract(sourcePath) {


        const mapsPath =
            path.join(
                sourcePath,
                "data",
                "maps"
            );


        const gates = {};



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



            const entry = {


                id:
                    data.id,


                soft: [],


                hard: []


            };



            //--------------------------------
            // Flash
            //--------------------------------

            if (
                data.requires_flash === true
            ) {

                entry.soft.push({

                    type: "FLASH",

                    reason:
                        "navigation"

                });

            }



            //--------------------------------
            // Remove empty entries
            //--------------------------------

            if (
                entry.soft.length > 0 ||
                entry.hard.length > 0
            ) {

                gates[data.id] =
                    entry;

            }


        }



        return gates;


    }


}


module.exports = LocationGateExtractor;