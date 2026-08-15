/**
 * Pokémon Companion
 * Location Graph Service
 *
 * Provides map traversal.
 *
 * Responsibilities:
 * - Load location graph.
 * - Find connected locations.
 * - Find reachable locations.
 *
 * Does NOT:
 * - Build graphs.
 * - Handle progression.
 * - Handle HM requirements.
 * - Handle obstacles.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationGraphService {


    constructor(game) {


        const databasePath =
            path.join(
                __dirname,
                "../../database/raw",
                game
            );


        this.graph =
            JSON.parse(
                fs.readFileSync(
                    path.join(
                        databasePath,
                        "location-graph.json"
                    ),
                    "utf8"
                )
            );


    }





    getConnections(location) {


        return (
            this.graph[location]
            ||
            []
        );


    }





    getReachableLocations(
        startLocation
    ) {


        const visited =
            new Set();



        const queue =
        [
            startLocation
        ];



        while(queue.length > 0)
        {


            const current =
                queue.shift();



            if(
                visited.has(current)
            )
            {

                continue;

            }



            visited.add(
                current
            );



            const connections =
                this.getConnections(
                    current
                );



            for(
                const connection of connections
            )
            {


                if(
                    !visited.has(
                        connection.location
                    )
                )
                {


                    queue.push(
                        connection.location
                    );


                }


            }


        }



        return [
            ...visited
        ];

    }





    isReachable(
        from,
        to
    )
    {


        return this
            .getReachableLocations(
                from
            )
            .includes(
                to
            );


    }


}


module.exports = LocationGraphService;