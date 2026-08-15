/**
 * Pokémon Companion
 * Location Graph Extractor
 *
 * Extracts the world traversal graph.
 *
 * Responsibilities:
 * - Read map connections.
 * - Extract connected locations.
 * - Extract warp connections.
 * - Clean duplicate connections.
 * - Remove non-world maps.
 *
 * Does NOT:
 * - Build progression.
 * - Handle player state.
 * - Handle HM requirements.
 * - Handle obstacles.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationGraphExtractor {


    extract(sourcePath) {


        const mapsPath =
            path.join(
                sourcePath,
                "data",
                "maps"
            );



        const graph = {};



        const ignoredMaps = [

            "MAP_UNION_ROOM",
            "MAP_TRADE_CENTER",
            "MAP_BATTLE_COLOSSEUM_2P",
            "MAP_BATTLE_COLOSSEUM_4P"

        ];



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



            if (
                ignoredMaps.includes(
                    data.id
                )
            ) {

                continue;

            }



            graph[data.id] = [];



            //--------------------------------
            // Normal connections
            //--------------------------------

            if (data.connections) {


                for (
                    const connection of data.connections
                ) {


                    if (!connection.map) {

                        continue;

                    }



                    graph[data.id].push({

                        location:
                            connection.map,


                        requirements: []

                    });


                }


            }



            //--------------------------------
            // Warp connections
            //--------------------------------

            if (data.warp_events) {


                for (
                    const warp of data.warp_events
                ) {


                    if (!warp.dest_map) {

                        continue;

                    }



                    if (
                        warp.dest_map === "MAP_DYNAMIC"
                    ) {

                        continue;

                    }



                    if (
                        this.isIndoorMap(data.id)
                        &&
                        this.isIndoorMap(warp.dest_map)
                    ) {

                        continue;

                    }



                    graph[data.id].push({

                        location:
                            warp.dest_map,


                        requirements: []

                    });


                }


            }


        }



        //--------------------------------
        // Remove duplicate edges
        //--------------------------------

        this.removeDuplicates(
            graph
        );



        return graph;


    }





    isIndoorMap(map) {


        return (

            map.includes("POKEMON_CENTER")
            ||
            map.includes("HOUSE")
            ||
            map.includes("MART")
            ||
            map.includes("GYM")
            ||
            map.includes("LAB")
            ||
            map.includes("CAVE")
            ||
            map.includes("DEPARTMENT_STORE")
            ||
            map.includes("CONDOMINIUMS")

        );


    }





    removeDuplicates(graph) {


        for (
            const location in graph
        ) {


            const unique = [];

            const seen =
                new Set();



            for (
                const connection of graph[location]
            ) {


                const key =
                    connection.location;



                if (
                    seen.has(key)
                ) {

                    continue;

                }



                seen.add(key);



                unique.push(
                    connection
                );


            }



            graph[location] =
                unique;


        }


    }


}


module.exports = LocationGraphExtractor;