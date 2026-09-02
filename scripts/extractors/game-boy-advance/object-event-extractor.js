/**
 * Pokémon Companion
 * Object Event Extractor
 *
 * Extracts map object events.
 *
 * Responsibilities:
 * - Read map event data.
 * - Extract object graphics.
 * - Extract local object IDs.
 * - Extract numeric object IDs.
 * - Extract clone event references.
 * - Extract script references.
 * - Extract hide flags.
 * - Extract positions.
 *
 * Does NOT:
 * - Resolve event logic.
 * - Classify NPCs.
 * - Handle progression.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class ObjectEventExtractor
{


    //--------------------------------
    // Extract all object events
    //--------------------------------

    extract(
        referencePath
    )
    {

        const mapsPath =
            path.join(

                referencePath,

                "data/maps"

            );


        const objects =
            [];


        const maps =
            fs.readdirSync(

                mapsPath

            );


        for(
            const map of maps
        )
        {

            const file =
                path.join(

                    mapsPath,

                    map,

                    "events.inc"

                );


            if(
                !fs.existsSync(
                    file
                )
            )
            {

                continue;

            }


            const mapFile =
                path.join(

                    mapsPath,

                    map,

                    "map.json"

                );


            const localIds =
                this.extractLocalIds(
                    mapFile
                );


            const data =
                this.extractFile(

                    file,

                    map,

                    localIds

                );


            objects.push(
                ...data
            );

        }


        return objects;

    }


    //--------------------------------
    // Extract local IDs from map.json
    //--------------------------------

    extractLocalIds(
        mapFile
    )
    {

        if(
            !fs.existsSync(
                mapFile
            )
        )
        {

            return [];

        }


        const data =
            JSON.parse(

                fs.readFileSync(

                    mapFile,

                    "utf8"

                )

            );


        if(
            !Array.isArray(
                data.object_events
            )
        )
        {

            return [];

        }


        return data.object_events.map(

            object =>

                object.local_id
                ||
                null

        );

    }


    //--------------------------------
    // Extract objects from events.inc
    //--------------------------------

    extractFile(
        file,
        map,
        localIds = []
    )
    {

        const content =
            fs.readFileSync(

                file,

                "utf8"

            );


        const objects =
            [];


        //--------------------------------
        // Normal object events
        //--------------------------------

        const objectRegex =
            /object_event\s+(\d+),\s*([A-Z0-9_]+),\s*(\d+),\s*(\d+),\s*(\d+),\s*[A-Z0-9_]+,\s*\d+,\s*\d+,\s*[A-Z0-9_]+,\s*0,\s*([A-Za-z0-9_]+),\s*([A-Z0-9_]+)/g;


        let match;


        while(
            (
                match =
                    objectRegex.exec(
                        content
                    )
            )
        )
        {

            const id =
                Number(
                    match[1]
                );


            objects.push({

                map,


                id,


                eventType:
                    "OBJECT_EVENT",


                localId:
                    localIds[id - 1]
                    ||
                    null,


                graphics:
                    match[2],


                position:
                {

                    x:
                        Number(
                            match[3]
                        ),

                    y:
                        Number(
                            match[4]
                        ),

                    elevation:
                        Number(
                            match[5]
                        )

                },


                script:
                    match[6],


                hideFlag:
                    match[7]

            });

        }


        //--------------------------------
        // Clone events
        //--------------------------------
        //
        // FireRed clone_event syntax:
        //
        // clone_event <id>, <graphics>, <x>, <y>, <localId>, <sourceMap>
        //
        // Example:
        //
        // clone_event 10, OBJ_EVENT_GFX_CUT_TREE, 50, 18,
        // LOCALID_ROUTE9_CUT_TREE, MAP_ROUTE9
        //--------------------------------
            
        const cloneRegex =
            /clone_event\s+(\d+),\s*([A-Z0-9_]+),\s*(-?\d+),\s*(-?\d+),\s*([A-Za-z0-9_]+),\s*(MAP_[A-Z0-9_]+)/g;
            
            
        while(
            (
                match =
                    cloneRegex.exec(
                        content
                    )
            )
        )
        {
        
            const id =
                Number(
                    match[1]
                );
            
            
            objects.push({
            
                map,
            
            
                id,
            
            
                eventType:
                    "CLONE_EVENT",
            
            
                localId:
                    match[5],
            
            
                graphics:
                    match[2],
            
            
                position:
                {
                
                    x:
                        Number(
                            match[3]
                        ),
                    
                    y:
                        Number(
                            match[4]
                        )
                    
                },
            
            
                script:
                    null,
            
            
                hideFlag:
                    null,
            
            
                sourceMap:
                    match[6]
            
            });
        
        }


        return objects;

    }


}


module.exports =
    ObjectEventExtractor;