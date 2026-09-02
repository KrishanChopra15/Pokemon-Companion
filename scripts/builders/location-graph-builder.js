/**
 * Pokémon Companion
 * Location Graph Builder
 *
 * Builds final map connection graph.
 *
 * Responsibilities:
 * - Read extracted location graph.
 * - Normalize connection records.
 * - Preserve traversal requirements.
 * - Remove invalid destinations.
 * - Remove duplicate connections.
 * - Save generated location graph.
 *
 * Does NOT:
 * - Parse ROM data.
 * - Extract map connections.
 * - Infer progression.
 * - Handle player state.
 * - Handle obstacles.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");





class LocationGraphBuilder
{


    build(
        sourcePath,
        game
    )
    {

        //--------------------------------
        // Raw graph
        //--------------------------------

        const rawGraphPath =
            path.join(

                process.cwd(),

                "database",

                "raw",

                game,

                "location-graph.json"

            );


        if(
            !fs.existsSync(
                rawGraphPath
            )
        )
        {

            throw new Error(

                `Raw location graph missing: ${rawGraphPath}`

            );

        }


        const rawGraph =
            JSON.parse(

                fs.readFileSync(

                    rawGraphPath,

                    "utf8"

                )

            );


        const graph = {};





        //--------------------------------
        // Normalize graph
        //--------------------------------

        for(
            const [
                locationId,
                connections
            ]
            of
                Object.entries(
                    rawGraph
                )
        )
        {

            if(
                !locationId
            )
            {

                continue;

            }


            graph[locationId] =
                [];


            if(
                !Array.isArray(
                    connections
                )
            )
            {

                continue;

            }


            for(
                const connection of
                    connections
            )
            {

                const normalized =
                    this.normalizeConnection(

                        connection

                    );


                if(
                    !normalized
                )
                {

                    continue;

                }


                if(
                    !graph[locationId]
                        .some(

                            existing =>

                                this.connectionKey(
                                    existing
                                )
                                ===
                                this.connectionKey(
                                    normalized
                                )

                        )
                )
                {

                    graph[locationId].push(

                        normalized

                    );

                }

            }

        }





        //--------------------------------
        // Save
        //--------------------------------

        const output =
            path.join(

                process.cwd(),

                "database",

                "generated",

                game,

                "location-graph.json"

            );


        fs.mkdirSync(

            path.dirname(
                output
            ),

            {
                recursive:
                    true
            }

        );


        fs.writeFileSync(

            output,

            JSON.stringify(

                graph,

                null,

                2

            ),

            "utf8"

        );


        console.log(

            `Generated location graph: ${Object.keys(graph).length} locations`

        );


        return graph;

    }





    //--------------------------------
    // Normalize connection
    //--------------------------------

    normalizeConnection(
        connection
    )
    {

        //--------------------------------
        // Backward compatibility with old
        // string-based raw graph.
        //--------------------------------

        if(
            typeof connection ===
                "string"
        )
        {

            if(
                !this.isValidDestination(
                    connection
                )
            )
            {

                return null;

            }


            return {

                location:
                    connection,

                type:
                    "UNKNOWN",

                requirements:
                    [],

                metadata:
                    {}

            };

        }


        //--------------------------------
        // Object connection
        //--------------------------------

        if(
            !connection
            ||
            typeof connection !==
                "object"
        )
        {

            return null;

        }


        if(
            !this.isValidDestination(
                connection.location
            )
        )
        {

            return null;

        }


        const requirements =
            Array.isArray(
                connection.requirements
            )
            ?
            connection.requirements
            :
            [];


        const normalizedRequirements =
            [];


        for(
            const requirement of
                requirements
        )
        {

            if(
                !requirement
            )
            {

                continue;

            }


            if(
                typeof requirement ===
                    "string"
            )
            {

                if(
                    !normalizedRequirements.includes(
                        requirement
                    )
                )
                {

                    normalizedRequirements.push(
                        requirement
                    );

                }

                continue;

            }


            if(
                typeof requirement !==
                    "object"
            )
            {

                continue;

            }


            const normalized =
            {

                ...requirement

            };


            const key =
                JSON.stringify(
                    normalized
                );


            const exists =
                normalizedRequirements.some(

                    existing =>

                        JSON.stringify(
                            existing
                        )
                        ===
                        key

                );


            if(
                !exists
            )
            {

                normalizedRequirements.push(
                    normalized
                );

            }

        }


        return {

            location:
                connection.location,

            type:
                connection.type
                ||
                "UNKNOWN",

            requirements:
                normalizedRequirements,

            metadata:
                connection.metadata
                &&
                typeof connection.metadata ===
                    "object"
                ?
                {
                    ...connection.metadata
                }
                :
                {}

        };

    }





    //--------------------------------
    // Connection identity
    //--------------------------------

    connectionKey(
        connection
    )
    {

        return [

            connection.location,

            connection.type
            ||
            "UNKNOWN",

            JSON.stringify(

                connection.requirements
                ||
                []

            )

        ]
        .join("|");

    }





    //--------------------------------
    // Destination validation
    //--------------------------------

    isValidDestination(
        destination
    )
    {

        if(
            !destination
        )
        {

            return false;

        }


        if(
            destination ===
                "MAP_DYNAMIC"
        )
        {

            return false;

        }


        return true;

    }


}





module.exports =
    LocationGraphBuilder;