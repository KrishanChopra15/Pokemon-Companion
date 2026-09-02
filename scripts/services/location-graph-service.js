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
 * - Respect connection requirements supplied by the caller.
 *
 * Does NOT:
 * - Build graphs.
 * - Handle progression.
 * - Define HM requirements.
 * - Handle obstacles.
 * - Determine whether a requirement is satisfied.
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
        startLocation,
        canTraverse = () => true
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


                const destination =
                    typeof connection === "string"
                        ? connection
                        : connection.location;



                const requirements =
                    typeof connection === "string"
                        ? []
                        : (
                            connection.requirements
                            ||
                            []
                        );



                if(
                    !destination
                )
                {

                    continue;

                }



                if(
                    visited.has(
                        destination
                    )
                )
                {

                    continue;

                }



                if(
                    !canTraverse(
                        requirements,
                        connection
                    )
                )
                {

                    continue;

                }



                queue.push(
                    destination
                );


            }


        }



        return [
            ...visited
        ];

    }





    isReachable(
        from,
        to,
        canTraverse = () => true
    )
    {


        return this
            .getReachableLocations(
                from,
                canTraverse
            )
            .includes(
                to
            );


    }


}


module.exports = LocationGraphService;