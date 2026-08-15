/**
 * Pokémon Companion
 * Location Extractor
 *
 * Extracts map metadata from pokefirered source.
 *
 * Responsibilities:
 * - Read map.json files.
 * - Extract location metadata.
 *
 * Does NOT:
 * - Generate databases.
 * - Build location graphs.
 * - Handle progression.
 * - Analyze obstacles.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationExtractor {


    extract(sourcePath) {


        const mapsPath =
            path.join(
                sourcePath,
                "data",
                "maps"
            );



        const locations = [];



        if (!fs.existsSync(mapsPath)) {


            throw new Error(
                `Maps directory not found: ${mapsPath}`
            );


        }



        const maps =
            fs.readdirSync(
                mapsPath
            )
            .sort();



        for (const map of maps) {


            const mapFile =
                path.join(
                    mapsPath,
                    map,
                    "map.json"
                );



            if (
                !fs.existsSync(mapFile)
            ) {

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



            locations.push({

                id:
                    data.id,


                folder:
                    map,


                name:
                    formatName(
                        data.name
                    ),



                layout:
                    data.layout || null,



                region:
                    data.region_map_section || null,



                mapType:
                    data.map_type || null,



                floor:
                    data.floor_number || 0,



                music:
                    data.music || null,



                requiresFlash:
                    data.requires_flash === true,



                connectionCount:
                    data.connections
                        ? data.connections.length
                        : 0,



                warpCount:
                    data.warp_events
                        ? data.warp_events.length
                        : 0

            });


        }



        return locations;

    }


}



function formatName(value = "") {


    return value

        .replace(
            /_/g,
            " "
        )


        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        )


        .replace(
            /([A-Z]+)([A-Z][a-z])/g,
            "$1 $2"
        )


        .replace(
            /\s+/g,
            " "
        )


        .trim();

}



module.exports = LocationExtractor;