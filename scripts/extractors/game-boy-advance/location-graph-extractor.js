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
 * - Detect destination obstacles referenced by
 *   map clone objects.
 * - Attach traversal requirements to individual
 *   connections.
 * - Detect Surf-dependent connections from
 *   actual FireRed map terrain.
 * - Apply explicit FireRed world connection gates.
 * - Clean duplicate connections.
 * - Remove non-world maps.
 *
 * Does NOT:
 * - Build progression.
 * - Handle player state.
 * - Execute progression.
 * - Handle trainer battles.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");


const TerrainExtractor =
    require("./terrain-extractor");



class LocationGraphExtractor
{


    constructor()
    {

        this.terrainExtractor =
            null;

    }





    //--------------------------------
    // Extract world graph
    //--------------------------------

    extract(
        sourcePath
    )
    {

        const mapsPath =
            path.join(

                sourcePath,

                "data",

                "maps"

            );



        if(
            !fs.existsSync(
                mapsPath
            )
        )
        {

            throw new Error(

                `Maps directory not found: ${mapsPath}`

            );

        }



        //--------------------------------
        // Load map data
        //--------------------------------

        const mapData =
            this.loadMapData(

                mapsPath

            );



        //--------------------------------
        // Load terrain extractor
        //
        // TerrainExtractor caches:
        // - layouts
        // - map.bin
        // - tileset attributes
        // - collision
        // - elevation
        // - Surfable terrain
        //--------------------------------

        this.terrainExtractor =
            new TerrainExtractor();


        this.terrainExtractor.extract(

            sourcePath

        );



        const graph =
            {};


        const ignoredMaps =
        [

            "MAP_UNION_ROOM",

            "MAP_TRADE_CENTER",

            "MAP_BATTLE_COLOSSEUM_2P",

            "MAP_BATTLE_COLOSSEUM_4P"

        ];



        //--------------------------------
        // Build graph
        //--------------------------------

        for(
            const [
                mapId,
                data
            ]
            of
            Object.entries(
                mapData
            )
        )
        {

            if(
                ignoredMaps.includes(
                    mapId
                )
            )
            {

                continue;

            }


            graph[mapId] =
                [];



            //--------------------------------
            // Normal connections
            //--------------------------------

            if(
                Array.isArray(
                    data.connections
                )
            )
            {

                for(
                    const connection of
                        data.connections
                )
                {

                    if(
                        !connection
                        ||
                        !connection.map
                    )
                    {

                        continue;

                    }


                    const requirements =
                        this.getConnectionRequirements(

                            data,

                            connection,

                            mapData

                        );


                    graph[mapId].push({

                        location:
                            connection.map,

                        type:
                            "CONNECTION",

                        requirements,

                        metadata:
                        {

                            direction:
                                connection.direction
                                ??
                                null,

                            offset:
                                connection.offset
                                ??
                                null,

                            map:
                                connection.map

                        }

                    });

                }

            }



            //--------------------------------
            // Warp connections
            //--------------------------------

            if(
                Array.isArray(
                    data.warp_events
                )
            )
            {

                for(
                    const warp of
                        data.warp_events
                )
                {

                    if(
                        !warp
                        ||
                        !warp.dest_map
                    )
                    {

                        continue;

                    }



                    //--------------------------------
                    // Ignore dynamic warps
                    //--------------------------------

                    if(
                        warp.dest_map ===
                            "MAP_DYNAMIC"
                    )
                    {

                        continue;

                    }



                    //--------------------------------
                    // Ignore indoor-to-indoor
                    // connections
                    //--------------------------------

                    if(
                        this.isIndoorMap(
                            mapId
                        )
                        &&
                        this.isIndoorMap(
                            warp.dest_map
                        )
                    )
                    {

                        continue;

                    }



                    const requirements =
                        this.getWarpRequirements(

                            data,

                            warp,

                            mapData

                        );



                    graph[mapId].push({

                        location:
                            warp.dest_map,

                        type:
                            "WARP",

                        requirements,

                        metadata:
                        {

                            x:
                                warp.x
                                ??
                                null,

                            y:
                                warp.y
                                ??
                                null,

                            elevation:
                                warp.elevation
                                ??
                                null,

                            destWarpId:
                                warp.dest_warp_id
                                ??
                                warp.dest_warp
                                ??
                                null

                        }

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





    //--------------------------------
    // Load map data
    //--------------------------------

    loadMapData(
        mapsPath
    )
    {

        const result =
            {};


        const maps =
            fs.readdirSync(

                mapsPath,

                {
                    withFileTypes:
                        true
                }

            );


        for(
            const mapEntry of
                maps
        )
        {

            if(
                !mapEntry.isDirectory()
            )
            {

                continue;

            }



            const mapDirectory =
                path.join(

                    mapsPath,

                    mapEntry.name

                );


            const mapFile =
                path.join(

                    mapDirectory,

                    "map.json"

                );



            if(
                !fs.existsSync(
                    mapFile
                )
            )
            {

                continue;

            }



            const data =
                JSON.parse(

                    fs.readFileSync(

                        mapFile,

                        "utf8"

                    )

                );



            if(
                !data.id
            )
            {

                continue;

            }



            result[data.id] =
                data;

        }



        return result;

    }





    //--------------------------------
    // Determine requirements for one
    // normal map connection
    //--------------------------------

    getConnectionRequirements(
        sourceMap,
        connection,
        mapData
    )
    {

        const requirements =
            [];


        const destinationMap =
            mapData[
                connection.map
            ];



        if(
            !destinationMap
        )
        {

            return requirements;

        }



        //--------------------------------
        // Find clone objects on the source
        // map that explicitly target the
        // destination map.
        //--------------------------------

        const objectEvents =
            Array.isArray(
                sourceMap.object_events
            )
            ?
            sourceMap.object_events
            :
            [];



        for(
            const object of
                objectEvents
        )
        {

            if(
                !object
                ||
                object.type !==
                    "clone"
            )
            {

                continue;

            }



            if(
                object.target_map !==
                    connection.map
            )
            {

                continue;

            }



            if(
                !object.target_local_id
            )
            {

                continue;

            }



            //--------------------------------
            // Resolve target obstacle in
            // destination map.
            //--------------------------------

            const target =
                this.findObjectByLocalId(

                    destinationMap,

                    object.target_local_id

                );



            if(
                !target
            )
            {

                continue;

            }



            const requirementType =
                this.getObstacleRequirementType(

                    target

                );



            if(
                !requirementType
            )
            {

                continue;

            }



            this.addRequirement(

                requirements,

                {
                    type:
                        requirementType
                }

            );

        }



        //--------------------------------
        // Known FireRed world obstacles
        //
        // Snorlax blocks the Route 12
        // and Route 16 world connections.
        //--------------------------------

        const worldRequirement =
            this.getWorldConnectionRequirement(

                sourceMap.id,

                connection.map

            );


        if(
            worldRequirement
        )
        {

            this.addRequirement(

                requirements,

                {
                    type:
                        worldRequirement
                }

            );

        }



        //--------------------------------
        // Automatic Surf connection
        // detection
        //--------------------------------

        if(
            this.connectionRequiresSurf(

                sourceMap,

                connection,

                destinationMap

            )
        )
        {

            this.addRequirement(

                requirements,

                {
                    type:
                        "CAN_USE_SURF"
                }

            );

        }



        return requirements;

    }





    //--------------------------------
    // Determine requirements for one
    // warp.
    //--------------------------------

    getWarpRequirements(
        sourceMap,
        warp,
        mapData
    )
    {

        return [];

    }





    //--------------------------------
    // Known FireRed connection gates
    //--------------------------------

    getWorldConnectionRequirement(
        sourceLocation,
        destinationLocation
    )
    {

        //--------------------------------
        // Route 12 Snorlax
        //--------------------------------

        if(
            (
                sourceLocation ===
                    "MAP_ROUTE12"
                &&
                destinationLocation ===
                    "MAP_ROUTE13"
            )
            ||
            (
                sourceLocation ===
                    "MAP_ROUTE13"
                &&
                destinationLocation ===
                    "MAP_ROUTE12"
            )
        )
        {

            return "CAN_USE_POKE_FLUTE";

        }



        //--------------------------------
        // Route 16 Snorlax
        //--------------------------------

        if(
            (
                sourceLocation ===
                    "MAP_ROUTE16"
                &&
                destinationLocation ===
                    "MAP_ROUTE17"
            )
            ||
            (
                sourceLocation ===
                    "MAP_ROUTE17"
                &&
                destinationLocation ===
                    "MAP_ROUTE16"
            )
        )
        {

            return "CAN_USE_POKE_FLUTE";

        }



        //--------------------------------
        // Route 4 east exit
        //
        // Route 4 is represented as one
        // map even though Mt. Moon sits
        // between its western and eastern
        // portions.
        //
        // Reaching Cerulean from Route 4
        // therefore requires the Boulder
        // Badge, which represents having
        // completed the Mt. Moon passage.
        //--------------------------------

        if(
            (
                sourceLocation ===
                    "MAP_ROUTE4"
                &&
                destinationLocation ===
                    "MAP_CERULEAN_CITY"
            )
            ||
            (
                sourceLocation ===
                    "MAP_CERULEAN_CITY"
                &&
                destinationLocation ===
                    "MAP_ROUTE4"
            )
        )
        {

            return "BOULDER_BADGE";

        }



        return null;

    }





//--------------------------------
// Determine whether a connection
// requires Surf.
//
// A connection requires Surf only
// when:
// - no valid land-to-land crossing
//   exists
// - at least one valid
//   water-to-water crossing exists
//
// Uses actual FireRed terrain,
// collision, directional blockers,
// and connection offset.
//--------------------------------

connectionRequiresSurf(
    sourceMap,
    connection,
    destinationMap
)
{
    if(
        !sourceMap
        ||
        !connection
        ||
        !destinationMap
        ||
        !this.terrainExtractor
    )
    {
        return false;
    }


    //--------------------------------
    // Resolve layout IDs
    //--------------------------------

    const sourceLayoutId =
        sourceMap.layout;

    const destinationLayoutId =
        destinationMap.layout;


    if(
        !sourceLayoutId
        ||
        !destinationLayoutId
    )
    {
        return false;
    }


    //--------------------------------
    // Resolve layouts
    //--------------------------------

    const sourceLayout =
        this.terrainExtractor.getLayout(
            sourceLayoutId
        );

    const destinationLayout =
        this.terrainExtractor.getLayout(
            destinationLayoutId
        );


    if(
        !sourceLayout
        ||
        !destinationLayout
    )
    {
        return false;
    }


    //--------------------------------
    // Resolve direction
    //--------------------------------

    const direction =
        String(
            connection.direction ||
            ""
        )
        .toLowerCase();


    //--------------------------------
    // Resolve offset
    //--------------------------------

    const offset =
        Number.isFinite(
            Number(
                connection.offset
            )
        )
        ?
        Number(
            connection.offset
        )
        :
        0;


    //--------------------------------
    // Only FireRed connection
    // directions are valid here.
    //--------------------------------

    if(
        ![
            "up",
            "down",
            "left",
            "right"
        ].includes(
            direction
        )
    )
    {
        return false;
    }


    //--------------------------------
    // Generate the exact aligned
    // source/destination crossing
    // pairs using the FireRed
    // connection geometry.
    //--------------------------------

    const pairs =
        this.getConnectionCrossingPairs(
            sourceLayout,
            destinationLayout,
            direction,
            offset
        );


    if(
        pairs.length === 0
    )
    {
        return false;
    }


    //--------------------------------
    // FireRed checks the source tile
    // from the opposite direction.
    //--------------------------------

    const oppositeDirection =
    {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
    }[
        direction
    ];


    let landCrossings =
        0;


    let surfCrossings =
        0;


    //--------------------------------
    // Test every aligned crossing
    //--------------------------------

    for(
        const pair of pairs
    )
    {
        //--------------------------------
        // Source terrain
        //--------------------------------

        const sourceCollision =
            this.terrainExtractor.getCollisionAt(
                sourceLayoutId,
                pair.source.x,
                pair.source.y
            );


        const sourceBehavior =
            this.terrainExtractor.getMetatileBehavior(
                sourceLayoutId,
                pair.source.x,
                pair.source.y
            );


        const sourceSurfable =
            this.terrainExtractor.isSurfableAt(
                sourceLayoutId,
                pair.source.x,
                pair.source.y
            );


        //--------------------------------
        // Destination terrain
        //--------------------------------

        const destinationCollision =
            this.terrainExtractor.getCollisionAt(
                destinationLayoutId,
                pair.destination.x,
                pair.destination.y
            );


        const destinationBehavior =
            this.terrainExtractor.getMetatileBehavior(
                destinationLayoutId,
                pair.destination.x,
                pair.destination.y
            );


        const destinationSurfable =
            this.terrainExtractor.isSurfableAt(
                destinationLayoutId,
                pair.destination.x,
                pair.destination.y
            );


        //--------------------------------
        // Ordinary land crossing
        //--------------------------------

        let canWalk =
            sourceCollision === 0
            &&
            destinationCollision === 0
            &&
            !sourceSurfable
            &&
            !destinationSurfable;


        //--------------------------------
        // FireRed directional blockers
        //--------------------------------

        if(
            canWalk
        )
        {
            if(
                this.terrainExtractor.isDirectionallyBlocked(
                    sourceBehavior,
                    oppositeDirection
                )
                ||
                this.terrainExtractor.isDirectionallyBlocked(
                    destinationBehavior,
                    direction
                )
            )
            {
                canWalk = false;
            }
        }


        //--------------------------------
        // Count valid land crossing
        //--------------------------------

        if(
            canWalk
        )
        {
            landCrossings++;
        }


        //--------------------------------
        // Surf crossing
        //
        // Both sides must be:
        // - collision-free
        // - Surfable water
        //
        // This intentionally does not
        // use the land directional check,
        // because Surf movement follows
        // different movement semantics.
        //--------------------------------

        const canSurf =
            sourceCollision === 0
            &&
            destinationCollision === 0
            &&
            sourceSurfable
            &&
            destinationSurfable;


        if(
            canSurf
        )
        {
            surfCrossings++;
        }
    }


    //--------------------------------
    // Surf is required when there is
    // no ordinary walking crossing,
    // but at least one valid water
    // crossing exists.
    //--------------------------------

    return (
        landCrossings === 0
        &&
        surfCrossings > 0
    );
}





    //--------------------------------
    // Get FireRed connection coordinate
    // range.
    //
    // Mirrors the interval used by:
    //
    // IsCoordInConnectingMap()
    //
    // FireRed tests:
    //
    // offset2 <= coord <= srcMax
    //
    // where:
    //
    // offset2 = max(offset, 0)
    //
    // srcMax = min(
    //     srcMax,
    //     destMax + offset
    // )
    //
    // Here srcMax / destMax represent
    // coordinate limits rather than the
    // last valid index.
    //--------------------------------

    getConnectionCoordinateRange(
        sourceSize,
        destinationSize,
        offset
    )
    {

        const result =
        {
            start:
                0,

            end:
                -1
        };


        if(
            !Number.isInteger(
                sourceSize
            )
            ||
            !Number.isInteger(
                destinationSize
            )
            ||
            !Number.isFinite(
                offset
            )
        )
        {

            return result;

        }



        //--------------------------------
        // FireRed:
        //
        // offset2 = max(offset, 0)
        //--------------------------------

        const offset2 =
            Math.max(
                offset,
                0
            );



        //--------------------------------
        // FireRed uses the source map
        // coordinate limit.
        //--------------------------------

        let srcMax =
            sourceSize - 1;



        //--------------------------------
        // Clamp using destination size
        // and connection offset.
        //--------------------------------

        const destinationMax =
            destinationSize +
            offset;


        if(
            destinationMax <
            srcMax
        )
        {

            srcMax =
                destinationMax;

        }



        //--------------------------------
        // Inclusive range used by the
        // original FireRed comparison:
        //
        // offset2 <= coord &&
        // coord <= srcMax
        //--------------------------------

        if(
            offset2 <=
                srcMax
        )
        {

            result.start =
                offset2;

            result.end =
                srcMax;

        }



        return result;

    }





    //--------------------------------
    // Get source/destination coordinate
    // pairs for one connection.
    //
    // Models the coordinate alignment
    // used by FireRed's connection
    // system.
    //--------------------------------

    getConnectionCrossingPairs(
        sourceLayout,
        destinationLayout,
        direction,
        offset
    )
    {

        const result =
            [];


        const sourceWidth =
            Number(
                sourceLayout.width
            );


        const sourceHeight =
            Number(
                sourceLayout.height
            );


        const destinationWidth =
            Number(
                destinationLayout.width
            );


        const destinationHeight =
            Number(
                destinationLayout.height
            );


        if(
            !Number.isInteger(
                sourceWidth
            )
            ||
            !Number.isInteger(
                sourceHeight
            )
            ||
            !Number.isInteger(
                destinationWidth
            )
            ||
            !Number.isInteger(
                destinationHeight
            )
            ||
            !Number.isFinite(
                offset
            )
        )
        {

            return result;

        }



        //--------------------------------
        // UP
        //--------------------------------

        if(
            direction ===
                "up"
        )
        {

            const range =
                this.getConnectionCoordinateRange(

                    sourceWidth,

                    destinationWidth,

                    offset

                );


            for(
                let sourceX =
                    range.start;

                sourceX <=
                    range.end;

                sourceX++
            )
            {

                const destinationX =
                    sourceX -
                    offset;


                if(
                    destinationX < 0
                    ||
                    destinationX >=
                        destinationWidth
                )
                {

                    continue;

                }


                result.push({

                    source:
                    {
                        x:
                            sourceX,

                        y:
                            0
                    },

                    destination:
                    {
                        x:
                            destinationX,

                        y:
                            destinationHeight - 1
                    }

                });

            }

        }



        //--------------------------------
        // DOWN
        //--------------------------------

        else if(
            direction ===
                "down"
        )
        {

            const range =
                this.getConnectionCoordinateRange(

                    sourceWidth,

                    destinationWidth,

                    offset

                );


            for(
                let sourceX =
                    range.start;

                sourceX <=
                    range.end;

                sourceX++
            )
            {

                const destinationX =
                    sourceX -
                    offset;


                if(
                    destinationX < 0
                    ||
                    destinationX >=
                        destinationWidth
                )
                {

                    continue;

                }


                result.push({

                    source:
                    {
                        x:
                            sourceX,

                        y:
                            sourceHeight - 1
                    },

                    destination:
                    {
                        x:
                            destinationX,

                        y:
                            0
                    }

                });

            }

        }



        //--------------------------------
        // LEFT
        //--------------------------------

        else if(
            direction ===
                "left"
        )
        {

            const range =
                this.getConnectionCoordinateRange(

                    sourceHeight,

                    destinationHeight,

                    offset

                );


            for(
                let sourceY =
                    range.start;

                sourceY <=
                    range.end;

                sourceY++
            )
            {

                const destinationY =
                    sourceY -
                    offset;


                if(
                    destinationY < 0
                    ||
                    destinationY >=
                        destinationHeight
                )
                {

                    continue;

                }


                result.push({

                    source:
                    {
                        x:
                            0,

                        y:
                            sourceY
                    },

                    destination:
                    {
                        x:
                            destinationWidth - 1,

                        y:
                            destinationY
                    }

                });

            }

        }



        //--------------------------------
        // RIGHT
        //--------------------------------

        else if(
            direction ===
                "right"
        )
        {

            const range =
                this.getConnectionCoordinateRange(

                    sourceHeight,

                    destinationHeight,

                    offset

                );


            for(
                let sourceY =
                    range.start;

                sourceY <=
                    range.end;

                sourceY++
            )
            {

                const destinationY =
                    sourceY -
                    offset;


                if(
                    destinationY < 0
                    ||
                    destinationY >=
                        destinationHeight
                )
                {

                    continue;

                }


                result.push({

                    source:
                    {
                        x:
                            sourceWidth - 1,

                        y:
                            sourceY
                    },

                    destination:
                    {
                        x:
                            0,

                        y:
                            destinationY
                    }

                });

            }

        }



        return result;

    }





    //--------------------------------
    // Find object by local ID
    //--------------------------------

    findObjectByLocalId(
        map,
        localId
    )
    {

        if(
            !map
            ||
            !Array.isArray(
                map.object_events
            )
        )
        {

            return null;

        }



        return (

            map.object_events.find(

                object =>

                    object
                    &&
                    object.local_id ===
                        localId

            )

            ||

            null

        );

    }





    //--------------------------------
    // Convert obstacle object to
    // traversal requirement.
    //--------------------------------

    getObstacleRequirementType(
        object
    )
    {

        if(
            !object
        )
        {

            return null;

        }



        //--------------------------------
        // Explicit field obstacle type
        //--------------------------------

        if(
            object.type ===
                "CUT"
        )
        {

            return "CAN_USE_CUT";

        }



        if(
            object.type ===
                "ROCK_SMASH"
        )
        {

            return "CAN_USE_ROCK_SMASH";

        }



        //--------------------------------
        // Object graphics fallback
        //--------------------------------

        const graphics =
            String(

                object.graphics_id

                ||

                ""

            )
            .toUpperCase();



        if(
            graphics.includes(
                "CUT_TREE"
            )
        )
        {

            return "CAN_USE_CUT";

        }



        if(
            graphics.includes(
                "ROCK_SMASH_ROCK"
            )
        )
        {

            return "CAN_USE_ROCK_SMASH";

        }



        return null;

    }





    //--------------------------------
    // Add unique requirement
    //--------------------------------

    addRequirement(
        requirements,
        requirement
    )
    {

        if(
            !requirement
            ||
            !requirement.type
        )
        {

            return;

        }



        const exists =
            requirements.some(

                existing =>

                    existing.type ===
                    requirement.type

            );


        if(
            exists
        )
        {

            return;

        }



        requirements.push(

            requirement

        );

    }





    //--------------------------------
    // Indoor map detection
    //--------------------------------

    isIndoorMap(
        map
    )
    {

        if(
            !map
        )
        {

            return false;

        }



        return (

            map.includes(
                "POKEMON_CENTER"
            )

            ||

            map.includes(
                "HOUSE"
            )

            ||

            map.includes(
                "MART"
            )

            ||

            map.includes(
                "GYM"
            )

            ||

            map.includes(
                "LAB"
            )

            ||

            map.includes(
                "CAVE"
            )

            ||

            map.includes(
                "DEPARTMENT_STORE"
            )

            ||

            map.includes(
                "CONDOMINIUMS"
            )

        );

    }





    //--------------------------------
    // Remove duplicate edges
    //--------------------------------

    removeDuplicates(
        graph
    )
    {

        for(
            const location of
                Object.keys(
                    graph
                )
        )
        {

            const unique =
                [];


            const seen =
                new Set();



            for(
                const connection of
                    graph[location]
            )
            {

                if(
                    !connection
                    ||
                    !connection.location
                )
                {

                    continue;

                }



                const requirementsKey =
                    JSON.stringify(

                        connection.requirements
                        ||
                        []

                    );


                const key =
                [

                    connection.location,

                    connection.type
                    ||
                    "UNKNOWN",

                    requirementsKey

                ]
                .join(
                    "|"
                );


                if(
                    seen.has(
                        key
                    )
                )
                {

                    continue;

                }



                seen.add(

                    key

                );


                unique.push(

                    connection

                );

            }



            graph[location] =
                unique;

        }

    }


}



module.exports =
    LocationGraphExtractor;