/**
 * Pokémon Companion
 * Location Graph Builder
 *
 * Builds map connection graph.
 *
 * Responsibilities:
 * - Read location metadata.
 * - Read map warp connections.
 * - Build location adjacency graph.
 *
 * Does NOT:
 * - Parse ROM data.
 * - Handle progression.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationGraphBuilder {


    build(sourcePath, game) {


        const mapsPath =
            path.join(
                sourcePath,
                "data",
                "maps"
            );


        const graph = {};



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



            const locationId =
                data.id;



            if (!locationId) {

                continue;

            }



            if (!graph[locationId]) {

                graph[locationId] = [];

            }



            //--------------------------------
            // Warp connections
            //--------------------------------

            if (data.warp_events) {


                for (const warp of data.warp_events) {


                    const destination =
                        warp.dest_map;



                    if (
                        isValidDestination(destination) &&
                        !graph[locationId].includes(destination)
                    ) {


                        graph[locationId]
                            .push(destination);

                    }


                }

            }



            //--------------------------------
            // Map connections
            //--------------------------------

            if (data.connections) {


                for (const connection of data.connections) {


                    const destination =
                        connection.map;



                    if (
                        isValidDestination(destination) &&
                        !graph[locationId].includes(destination)
                    ) {

                        graph[locationId]
                            .push(destination);

                    }

                }

            }

        }



        const output =
            path.join(
                __dirname,
                "../../database/generated",
                game,
                "location-graph.json"
            );



        fs.writeFileSync(
            output,
            JSON.stringify(
                graph,
                null,
                2
            )
        );



        console.log(
            `Generated location graph: ${Object.keys(graph).length} locations`
        );


    }


}



function isValidDestination(destination) {


    if (!destination) {

        return false;

    }



    const invalidMaps = [

        "MAP_DYNAMIC"

    ];



    return !invalidMaps.includes(
        destination
    );

}



module.exports = LocationGraphBuilder;