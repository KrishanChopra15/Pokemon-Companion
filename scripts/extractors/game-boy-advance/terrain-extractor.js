/**
 * Pokémon Companion
 * Terrain Extractor
 *
 * Extracts terrain properties from FireRed map layouts.
 *
 * Responsibilities:
 * - Read map layouts.
 * - Read map.bin files.
 * - Read tileset metatile attribute tables.
 * - Resolve metatile behavior.
 * - Identify Surfable terrain.
 * - Provide coordinate-level terrain queries.
 * - Provide collision and elevation information.
 * - Provide basic land reachability without Surf.
 *
 * Does NOT:
 * - Decide world access.
 * - Create HARD_GATE / SOFT_GATE rules.
 * - Calculate player progression.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class TerrainExtractor
{


    constructor()
    {

        this.layouts =
            {};

        this.maps =
            {};

        this.tilesets =
            {};

        this.terrain =
            {};

    }





    //--------------------------------
    // Extract terrain database
    //--------------------------------

    extract(
        sourcePath
    )
    {

        //--------------------------------
        // Reset cached data
        //--------------------------------

        this.layouts =
            {};

        this.maps =
            {};

        this.tilesets =
            {};

        this.terrain =
            {};



        //--------------------------------
        // Paths
        //--------------------------------

        const layoutsFile =
            path.join(

                sourcePath,

                "data",

                "layouts",

                "layouts.json"

            );


        const metatilesHeader =
            path.join(

                sourcePath,

                "src",

                "data",

                "tilesets",

                "metatiles.h"

            );



        //--------------------------------
        // Validate source
        //--------------------------------

        if(
            !fs.existsSync(
                layoutsFile
            )
        )
        {

            throw new Error(

                `Missing layouts database: ${layoutsFile}`

            );

        }


        if(
            !fs.existsSync(
                metatilesHeader
            )
        )
        {

            throw new Error(

                `Missing tileset metadata: ${metatilesHeader}`

            );

        }



        //--------------------------------
        // Load layouts
        //--------------------------------

        const rawLayouts =
            JSON.parse(

                fs.readFileSync(

                    layoutsFile,

                    "utf8"

                )

            );


        const layouts =
            Array.isArray(
                rawLayouts
            )
            ?
            rawLayouts
            :
            Array.isArray(
                rawLayouts.layouts
            )
                ?
                rawLayouts.layouts
                :
                Object.values(
                    rawLayouts
                );



        //--------------------------------
        // Index layouts
        //--------------------------------

        for(
            const layout of
                layouts
        )
        {

            if(
                !layout
                ||
                !layout.id
            )
            {

                continue;

            }


            this.layouts[
                layout.id
            ] =
                layout;

        }



        //--------------------------------
        // Load tileset attributes
        //--------------------------------

        const tilesetAttributes =
            this.loadTilesetAttributes(

                sourcePath,

                metatilesHeader

            );



        //--------------------------------
        // Extract terrain
        //--------------------------------

        for(
            const layout of
                layouts
        )
        {

            if(
                !layout
                ||
                !layout.id
            )
            {

                continue;

            }



            //--------------------------------
            // Ignore incomplete layouts
            //--------------------------------

            if(
                !layout.blockdata_filepath
            )
            {

                continue;

            }



            if(
                !layout.primary_tileset
                ||
                layout.primary_tileset ===
                    "NULL"
            )
            {

                continue;

            }



            if(
                !layout.secondary_tileset
                ||
                layout.secondary_tileset ===
                    "NULL"
            )
            {

                continue;

            }



            //--------------------------------
            // Resolve map data
            //--------------------------------

            const mapFile =
                path.join(

                    sourcePath,

                    layout.blockdata_filepath

                );


            if(
                !fs.existsSync(
                    mapFile
                )
            )
            {

                console.warn(

                    `Missing map data for layout: ${layout.id}`

                );


                continue;

            }



            const map =
                fs.readFileSync(

                    mapFile

                );



            //--------------------------------
            // Validate map size
            //--------------------------------

            const expectedSize =
                layout.width *
                layout.height *
                2;


            if(
                map.length !==
                expectedSize
            )
            {

                throw new Error(

                    `Invalid map size for ${layout.id}: ` +
                    `expected ${expectedSize} bytes, ` +
                    `got ${map.length}`

                );

            }



            //--------------------------------
            // Resolve tilesets
            //--------------------------------

            const primaryAttributes =
                tilesetAttributes[
                    layout.primary_tileset
                ];


            const secondaryAttributes =
                tilesetAttributes[
                    layout.secondary_tileset
                ];



            if(
                !primaryAttributes
            )
            {

                console.warn(

                    `Missing primary tileset attributes: ${layout.primary_tileset} ` +
                    `(layout ${layout.id})`

                );


                continue;

            }


            if(
                !secondaryAttributes
            )
            {

                console.warn(

                    `Missing secondary tileset attributes: ${layout.secondary_tileset} ` +
                    `(layout ${layout.id})`

                );


                continue;

            }



            //--------------------------------
            // Cache map and tilesets
            //--------------------------------

            this.maps[
                layout.id
            ] =
                map;


            this.tilesets[
                layout.id
            ] =
            {

                primary:
                    primaryAttributes,

                secondary:
                    secondaryAttributes

            };



            //--------------------------------
            // Terrain counters
            //--------------------------------

            const surfableMetatiles =
                new Set();


            const surfableBehaviors =
                new Set();


            const behaviorCounts =
                {};



            //--------------------------------
            // Scan map
            //--------------------------------

            for(
                let offset = 0;

                offset < map.length;

                offset += 2

            )
            {

                const block =
                    map.readUInt16LE(

                        offset

                    );


                const metatile =
                    block &
                    TerrainExtractor
                        .MAPGRID_METATILE_ID_MASK;


                const behavior =
                    this.resolveMetatileBehavior(

                        layout,

                        metatile,

                        primaryAttributes,

                        secondaryAttributes

                    );


                if(
                    behavior ===
                        null
                )
                {

                    continue;

                }



                //--------------------------------
                // Behavior count
                //--------------------------------

                behaviorCounts[behavior] =
                    (
                        behaviorCounts[behavior]
                        ||
                        0
                    )
                    +
                    1;



                //--------------------------------
                // Surfable behavior
                //--------------------------------

                if(
                    TerrainExtractor
                        .SURFABLE_BEHAVIORS
                        .has(
                            behavior
                        )
                )
                {

                    surfableMetatiles.add(

                        metatile

                    );


                    surfableBehaviors.add(

                        behavior

                    );

                }

            }



            //--------------------------------
            // Store terrain information
            //--------------------------------

            this.terrain[
                layout.id
            ] =
            {

                width:
                    layout.width,

                height:
                    layout.height,

                primaryTileset:
                    layout.primary_tileset,

                secondaryTileset:
                    layout.secondary_tileset,

                hasSurfableTerrain:
                    surfableMetatiles.size > 0,

                surfableMetatileCount:
                    surfableMetatiles.size,

                surfableBehaviorCount:
                    surfableBehaviors.size,

                surfableBehaviors:
                    [
                        ...surfableBehaviors
                    ]
                    .sort(

                        (
                            a,
                            b
                        ) =>
                            a - b

                    ),

                behaviorCounts

            };

        }



        return this.terrain;

    }





    //--------------------------------
    // Resolve metatile behavior
    //--------------------------------

    resolveMetatileBehavior(
        layout,
        metatile,
        primaryAttributes,
        secondaryAttributes
    )
    {

        let attributes;



        //--------------------------------
        // Primary tileset
        //--------------------------------

        if(
            metatile <
            TerrainExtractor
                .NUM_METATILES_IN_PRIMARY
        )
        {

            attributes =
                primaryAttributes[
                    metatile
                ];

        }



        //--------------------------------
        // Secondary tileset
        //--------------------------------

        else if(
            metatile <
            TerrainExtractor
                .NUM_METATILES_TOTAL
        )
        {

            const secondaryIndex =
                metatile -
                TerrainExtractor
                    .NUM_METATILES_IN_PRIMARY;


            attributes =
                secondaryAttributes[
                    secondaryIndex
                ];

        }


        else
        {

            return null;

        }



        if(
            attributes ===
                undefined
        )
        {

            return null;

        }



        //--------------------------------
        // FireRed behavior
        //
        // Bits 0-8
        //--------------------------------

        return (
            attributes &
            TerrainExtractor
                .METATILE_BEHAVIOR_MASK
        );

    }





    //--------------------------------
    // Get layout
    //--------------------------------

    getLayout(
        layoutId
    )
    {

        return (

            this.layouts[
                layoutId
            ]

            ||

            null

        );

    }





    //--------------------------------
    // Get raw map-grid block
    //--------------------------------

    getMapGridBlock(
        layoutId,
        x,
        y
    )
    {

        const layout =
            this.layouts[
                layoutId
            ];


        const map =
            this.maps[
                layoutId
            ];


        if(
            !layout
            ||
            !map
        )
        {

            return null;

        }


        if(
            !Number.isInteger(
                x
            )
            ||
            !Number.isInteger(
                y
            )
        )
        {

            return null;

        }


        if(
            x < 0
            ||
            y < 0
            ||
            x >= layout.width
            ||
            y >= layout.height
        )
        {

            return null;

        }


        const offset =
            (
                y *
                layout.width +
                x
            )
            *
            2;


        if(
            offset < 0
            ||
            offset + 2 >
                map.length
        )
        {

            return null;

        }


        return map.readUInt16LE(

            offset

        );

    }





    //--------------------------------
    // Get map metatile
    //--------------------------------

    getMapMetatile(
        layoutId,
        x,
        y
    )
    {

        const block =
            this.getMapGridBlock(

                layoutId,

                x,

                y

            );


        if(
            block ===
                null
        )
        {

            return null;

        }



        //--------------------------------
        // FireRed map-grid format
        //
        // Bits 0-9:
        //     metatile ID
        //
        // Bits 10-11:
        //     collision
        //
        // Bits 12-15:
        //     elevation
        //--------------------------------

        return (
            block &
            TerrainExtractor
                .MAPGRID_METATILE_ID_MASK
        );

    }





    //--------------------------------
    // Get collision at coordinate
    //--------------------------------

    getCollisionAt(
        layoutId,
        x,
        y
    )
    {

        const block =
            this.getMapGridBlock(

                layoutId,

                x,

                y

            );


        if(
            block ===
                null
        )
        {

            return null;

        }


        return (

            (
                block &
                TerrainExtractor
                    .MAPGRID_COLLISION_MASK
            )
            >>
            TerrainExtractor
                .MAPGRID_COLLISION_SHIFT

        );

    }





    //--------------------------------
    // Get elevation at coordinate
    //--------------------------------

    getElevationAt(
        layoutId,
        x,
        y
    )
    {

        const block =
            this.getMapGridBlock(

                layoutId,

                x,

                y

            );


        if(
            block ===
                null
        )
        {

            return null;

        }


        return (

            (
                block &
                TerrainExtractor
                    .MAPGRID_ELEVATION_MASK
            )
            >>
            TerrainExtractor
                .MAPGRID_ELEVATION_SHIFT

        );

    }





    //--------------------------------
    // Get metatile behavior at
    // coordinate
    //--------------------------------

    getMetatileBehavior(
        layoutId,
        x,
        y
    )
    {

        const layout =
            this.layouts[
                layoutId
            ];


        const tilesets =
            this.tilesets[
                layoutId
            ];


        if(
            !layout
            ||
            !tilesets
        )
        {

            return null;

        }



        const metatile =
            this.getMapMetatile(

                layoutId,

                x,

                y

            );


        if(
            metatile ===
                null
        )
        {

            return null;

        }



        return this.resolveMetatileBehavior(

            layout,

            metatile,

            tilesets.primary,

            tilesets.secondary

        );

    }





    //--------------------------------
    // Terrain query
    //--------------------------------

    getTerrainAt(
        layoutId,
        x,
        y
    )
    {

        const block =
            this.getMapGridBlock(

                layoutId,

                x,

                y

            );


        if(
            block ===
                null
        )
        {

            return null;

        }



        const metatile =
            block &
            TerrainExtractor
                .MAPGRID_METATILE_ID_MASK;


        const behavior =
            this.getMetatileBehavior(

                layoutId,

                x,

                y

            );


        if(
            behavior ===
                null
        )
        {

            return null;

        }



        const collision =
            (
                block &
                TerrainExtractor
                    .MAPGRID_COLLISION_MASK
            )
            >>
            TerrainExtractor
                .MAPGRID_COLLISION_SHIFT;


        const elevation =
            (
                block &
                TerrainExtractor
                    .MAPGRID_ELEVATION_MASK
            )
            >>
            TerrainExtractor
                .MAPGRID_ELEVATION_SHIFT;


        const surfable =
            TerrainExtractor
                .SURFABLE_BEHAVIORS
                .has(
                    behavior
                );


        const passable =
            collision ===
                0;



        return {

            x:
                x,

            y:
                y,

            block:
                block,

            metatile:
                metatile,

            behavior:
                behavior,

            collision:
                collision,

            elevation:
                elevation,

            passable:
                passable,

            surfable:
                surfable

        };

    }





    //--------------------------------
    // Is Surfable at coordinate
    //--------------------------------

    isSurfableAt(
        layoutId,
        x,
        y
    )
    {

        const terrain =
            this.getTerrainAt(

                layoutId,

                x,

                y

            );


        return (

            terrain !==
                null

            &&

            terrain.surfable ===
                true

        );

    }





    //--------------------------------
    // Is normally walkable land
    // at coordinate
    //--------------------------------

    isLandPassableAt(
        layoutId,
        x,
        y
    )
    {

        const terrain =
            this.getTerrainAt(

                layoutId,

                x,

                y

            );


        return (

            terrain !==
                null

            &&

            terrain.passable ===
                true

            &&

            terrain.surfable ===
                false

        );

    }





//--------------------------------
// Determine whether a metatile
// behavior blocks movement in a
// specific direction.
//
// This mirrors FireRed's:
// MetatileBehavior_IsNorthBlocked()
// MetatileBehavior_IsSouthBlocked()
// MetatileBehavior_IsEastBlocked()
// MetatileBehavior_IsWestBlocked()
//--------------------------------

isDirectionallyBlocked(
    behavior,
    direction
)
{

    if(
        !Number.isInteger(
            behavior
        )
    )
    {

        return false;

    }


    const normalizedDirection =
        String(
            direction
            ||
            ""
        )
        .toLowerCase();


    const blockedBehaviors =
    {

        north:
        [
            0x32,
            0x34,
            0x35
        ],

        south:
        [
            0x33,
            0x36,
            0x37
        ],

        east:
        [
            0x30,
            0x34,
            0x36
        ],

        west:
        [
            0x31,
            0x35,
            0x37
        ]

    };


    const blocked =
        blockedBehaviors[
            normalizedDirection
        ];


    if(
        !blocked
    )
    {

        return false;

    }


    return blocked.includes(
        behavior
    );

}





    //--------------------------------
    // Determine whether movement into
    // a coordinate is allowed in a
    // specific direction.
    //
    // This mirrors the destination-side
    // directional portion of FireRed's
    // movement collision check.
    //--------------------------------
    
    isDirectionallyPassableAt(
        layoutId,
        x,
        y,
        direction
    )
    {
    
        const behavior =
            this.getMetatileBehavior(
            
                layoutId,
            
                x,
            
                y
            
            );
        
        
        if(
            behavior ===
                null
        )
        {
        
            return false;
        
        }
    
    
        return !this.isDirectionallyBlocked(
        
            behavior,
        
            direction
        
        );
    
    }





    //--------------------------------
    // Determine whether a target
    // coordinate can be reached
    // using ordinary land movement.
    //
    // Surfable tiles are treated
    // as barriers.
    //--------------------------------

    canReachWithoutSurf(
        layoutId,
        startX,
        startY,
        targetX,
        targetY
    )
    {

        const layout =
            this.layouts[
                layoutId
            ];


        if(
            !layout
        )
        {

            return false;

        }



        //--------------------------------
        // Validate start and target
        //--------------------------------

        const start =
            this.getTerrainAt(

                layoutId,

                startX,

                startY

            );


        const target =
            this.getTerrainAt(

                layoutId,

                targetX,

                targetY

            );


        if(
            !start
            ||
            !target
        )
        {

            return false;

        }



        //--------------------------------
        // Start and target must be
        // ordinary land.
        //--------------------------------

        if(
            !start.passable
            ||
            start.surfable
            ||
            !target.passable
            ||
            target.surfable
        )
        {

            return false;

        }



        //--------------------------------
        // Breadth-first search
        //--------------------------------

        const queue =
            [
                [
                    startX,
                    startY
                ]
            ];


        const visited =
            new Set();


        const key =
            (
                x,
                y
            ) =>
                `${x},${y}`;



        while(
            queue.length > 0
        )
        {

            const [
                x,
                y
            ] =
                queue.shift();


            const currentKey =
                key(

                    x,

                    y

                );


            if(
                visited.has(
                    currentKey
                )
            )
            {

                continue;

            }


            visited.add(
                currentKey
            );



            //--------------------------------
            // Target reached
            //--------------------------------

            if(
                x === targetX
                &&
                y === targetY
            )
            {

                return true;

            }



            //--------------------------------
            // Current tile must be ordinary
            // passable land.
            //--------------------------------

            if(
                !this.isLandPassableAt(

                    layoutId,

                    x,

                    y

                )
            )
            {

                continue;

            }



            //--------------------------------
            // Four-direction movement
            //--------------------------------

            const neighbors =
            [

                [
                    x + 1,
                    y
                ],

                [
                    x - 1,
                    y
                ],

                [
                    x,
                    y + 1
                ],

                [
                    x,
                    y - 1
                ]

            ];



            for(
                const [
                    nextX,
                    nextY
                ]
                of
                neighbors
            )
            {

                if(
                    nextX < 0
                    ||
                    nextY < 0
                    ||
                    nextX >= layout.width
                    ||
                    nextY >= layout.height
                )
                {

                    continue;

                }


                const nextKey =
                    key(

                        nextX,

                        nextY

                    );


                if(
                    visited.has(
                        nextKey
                    )
                )
                {

                    continue;

                }


                if(
                    this.isLandPassableAt(

                        layoutId,

                        nextX,

                        nextY

                    )
                )
                {

                    queue.push(

                        [
                            nextX,
                            nextY
                        ]

                    );

                }

            }

        }



        return false;

    }





    //--------------------------------
    // Get all ordinary land coordinates
    // reachable from a starting point.
    //--------------------------------
    
    getLandRegion(
        layoutId,
        startX,
        startY
    )
    {
    
        const layout =
            this.layouts[
                layoutId
            ];
        
        
        if(
            !layout
        )
        {
            return [];
        }
    
    
        if(
            !this.isLandPassableAt(
                layoutId,
                startX,
                startY
            )
        )
        {
            return [];
        }
    
    
        const queue =
            [
                [
                    startX,
                    startY
                ]
            ];
        
        
        const visited =
            new Set();
        
        
        const region =
            [];
        
        
        const key =
            (
                x,
                y
            ) =>
                `${x},${y}`;
    
    
        while(
            queue.length > 0
        )
        {
        
            const [
                x,
                y
            ] =
                queue.shift();
        
        
            const currentKey =
                key(
                    x,
                    y
                );
            
            
            if(
                visited.has(
                    currentKey
                )
            )
            {
                continue;
            }
        
        
            visited.add(
                currentKey
            );
        
        
            if(
                !this.isLandPassableAt(
                    layoutId,
                    x,
                    y
                )
            )
            {
                continue;
            }
        
        
            region.push(
                [
                    x,
                    y
                ]
            );
        
        
            const neighbors =
            [
                [
                    x + 1,
                    y
                ],
                [
                    x - 1,
                    y
                ],
                [
                    x,
                    y + 1
                ],
                [
                    x,
                    y - 1
                ]
            ];
        
        
            for(
                const [
                    nextX,
                    nextY
                ]
                of
                neighbors
            )
            {
            
                if(
                    nextX < 0
                    ||
                    nextY < 0
                    ||
                    nextX >= layout.width
                    ||
                    nextY >= layout.height
                )
                {
                    continue;
                }
            
            
                const nextKey =
                    key(
                        nextX,
                        nextY
                    );
                
                
                if(
                    visited.has(
                        nextKey
                    )
                )
                {
                    continue;
                }
            
            
                queue.push(
                    [
                        nextX,
                        nextY
                    ]
                );
            
            }
        
        }
    
    
        return region;
    
    }





    //--------------------------------
    // Load tileset attributes
    //--------------------------------

    loadTilesetAttributes(
        sourcePath,
        metatilesHeader
    )
    {

        const text =
            fs.readFileSync(

                metatilesHeader,

                "utf8"

            );


        const regex =
            /gMetatileAttributes_([A-Za-z0-9_]+)\[\][^;]*INCBIN_U32\("([^"]+)"\)/g;


        const result =
            {};


        let match;



        while(
            (
                match =
                    regex.exec(
                        text
                    )
            )
            !==
            null
        )
        {

            const symbol =
                `gTileset_${match[1]}`;


            const relativePath =
                match[2];


            const file =
                path.join(

                    sourcePath,

                    relativePath

                );



            if(
                !fs.existsSync(file)
            )
            {

                console.warn(

                    `Missing metatile attributes: ${file}`

                );


                continue;

            }



            const buffer =
                fs.readFileSync(

                    file

                );



            if(
                buffer.length %
                4 !==
                0
            )
            {

                throw new Error(

                    `Invalid metatile attribute size: ${file}`

                );

            }



            const attributes =
                [];


            for(
                let offset = 0;

                offset < buffer.length;

                offset += 4
            )
            {

                attributes.push(

                    buffer.readUInt32LE(

                        offset

                    )

                );

            }



            result[symbol] =
                attributes;

        }



        return result;

    }


}



//----------------------------------------
// FireRed map-grid constants
//----------------------------------------
//
// Bits 0-9:
//     metatile ID
//
// Bits 10-11:
//     collision
//
// Bits 12-15:
//     elevation
//----------------------------------------

TerrainExtractor.MAPGRID_METATILE_ID_MASK =
    0x03FF;


TerrainExtractor.MAPGRID_COLLISION_MASK =
    0x0C00;


TerrainExtractor.MAPGRID_ELEVATION_MASK =
    0xF000;


TerrainExtractor.MAPGRID_COLLISION_SHIFT =
    10;


TerrainExtractor.MAPGRID_ELEVATION_SHIFT =
    12;



//----------------------------------------
// FireRed metatile constants
//----------------------------------------

TerrainExtractor.NUM_METATILES_IN_PRIMARY =
    640;


TerrainExtractor.NUM_METATILES_TOTAL =
    1024;


TerrainExtractor.METATILE_BEHAVIOR_MASK =
    0x1FF;



//----------------------------------------
// FireRed Surfable behaviors
//----------------------------------------
//
// Taken from FireRed's
// MetatileBehavior_IsSurfable()
//----------------------------------------

TerrainExtractor.SURFABLE_BEHAVIORS =
    new Set(
    [

        0x10, // MB_POND_WATER
        0x11, // MB_FAST_WATER
        0x12, // MB_DEEP_WATER
        0x13, // MB_WATERFALL
        0x15, // MB_OCEAN_WATER
        0x1A, // MB_UNUSED_WATER
        0x1B, // MB_CYCLING_ROAD_WATER

        0x16, // MB_EASTWARD_CURRENT
        0x14, // MB_WESTWARD_CURRENT
        0x0E, // MB_NORTHWARD_CURRENT
        0x0F  // MB_SOUTHWARD_CURRENT

    ]);



module.exports =
    TerrainExtractor;