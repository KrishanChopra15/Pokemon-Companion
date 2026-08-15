/**
 * Pokémon Companion
 * Location Requirement Extractor
 *
 * Extracts map access requirements.
 *
 * Responsibilities:
 * - Read map.json files.
 * - Extract map restrictions.
 *
 * Does NOT:
 * - Generate databases.
 * - Handle progression logic.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationRequirementExtractor {


    extract(sourcePath) {


        const mapsPath =
            path.join(
                sourcePath,
                "data",
                "maps"
            );


        const requirements = {};



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

                requirements: []

            };



            //--------------------------------
            // Flash requirement
            //--------------------------------

            if (
                data.requires_flash === true
            ) {

                entry.requirements
                    .push(
                        "FLASH"
                    );

            }



            //--------------------------------
            // Store only maps with rules
            //--------------------------------

            if (
                entry.requirements.length > 0
            ) {

                requirements[data.id] =
                    entry;

            }


        }



        return requirements;


    }


}


module.exports = LocationRequirementExtractor;