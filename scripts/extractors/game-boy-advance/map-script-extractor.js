/**
 * Pokémon Companion
 * Map Script Extractor
 *
 * Extracts map-level script declarations and local object references.
 *
 * Responsibilities:
 * - Extract map_script declarations.
 * - Extract map_script_2 declarations.
 * - Extract local IDs referenced by map scripts.
 * - Preserve local ID references per script body.
 * - Preserve map name.
 * - Preserve trigger metadata.
 * - Preserve conditional variable/value metadata.
 *
 * Does NOT:
 * - Execute map scripts.
 * - Resolve script calls or jumps.
 * - Classify NPCs.
 * - Determine story progression.
 * - Resolve scene participants.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class MapScriptExtractor
{


    //--------------------------------
    // Extract all map scripts
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


        const results =
            {};


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

                    "scripts.inc"

                );


            if(
                !fs.existsSync(
                    file
                )
            )
            {

                continue;

            }


            const scripts =
                this.extractFile(

                    file,

                    map

                );


            if(
                scripts.mapScripts.length > 0
                ||
                scripts.conditionalScripts.length > 0
                ||
                scripts.localIds.length > 0
                ||
                scripts.scriptReferences.length > 0
            )
            {

                results[map] =
                    scripts;

            }

        }


        return results;

    }


    //--------------------------------
    // Extract map scripts from file
    //--------------------------------

    extractFile(
        file,
        map
    )
    {

        const content =
            fs.readFileSync(

                file,

                "utf8"

            );


        const mapScripts =
            [];


        const conditionalScripts =
            [];


        //--------------------------------
        // map_script
        //--------------------------------

        for(
            const match of
                content.matchAll(

                    /^\s*map_script\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addUnique(

                mapScripts,

                {

                    type:
                        "MAP_SCRIPT",

                    trigger:
                        match[1],

                    target:
                        match[2]

                }

            );

        }


        //--------------------------------
        // map_script_2
        //--------------------------------

        for(
            const match of
                content.matchAll(

                    /^\s*map_script_2\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*$/gm

                )
        )
        {

            this.addUnique(

                conditionalScripts,

                {

                    type:
                        "MAP_SCRIPT_2",

                    variable:
                        match[1],

                    value:
                        match[2],

                    target:
                        match[3]

                }

            );

        }


        //--------------------------------
        // Extract script bodies
        //--------------------------------

        const scriptBlocks =
            this.extractScriptBlocks(

                content

            );


        //--------------------------------
        // Local ID references by script
        //--------------------------------

        const scriptReferences =
            scriptBlocks.map(

                block =>
                {

                    const localIds =
                        [

                            ...block.body.matchAll(

                                /\b(LOCALID_[A-Za-z0-9_]+)\b/g

                            )

                        ]
                        .map(

                            match =>
                                match[1]

                        )
                        .filter(

                            (value, index, array) =>

                                array.indexOf(
                                    value
                                )
                                ===
                                index

                        );


                    return {

                        id:
                            block.id,

                        localIds

                    };

                }

            )
            .filter(

                block =>
                    block.localIds.length > 0

            );


        //--------------------------------
        // All local IDs in file
        //--------------------------------

        const localIds =
            scriptReferences
                .flatMap(

                    script =>
                        script.localIds

                )
                .filter(

                    (value, index, array) =>

                        array.indexOf(
                            value
                        )
                        ===
                        index

                );


        return {

            map,

            mapScripts,

            conditionalScripts,

            localIds,

            scriptReferences

        };

    }


    //--------------------------------
    // Extract named script blocks
    //--------------------------------

    extractScriptBlocks(
        content
    )
    {

        const regex =
            /([A-Za-z0-9_]+)::([\s\S]*?)(?=\n[A-Za-z0-9_]+::|$)/g;


        const blocks =
            [];


        let match;


        while(
            (
                match =
                    regex.exec(
                        content
                    )
            )
        )
        {

            blocks.push({

                id:
                    match[1],

                body:
                    match[2]

            });

        }


        return blocks;

    }


    //--------------------------------
    // Add unique record
    //--------------------------------

    addUnique(
        array,
        value
    )
    {

        const exists =
            array.some(

                existing =>

                    JSON.stringify(
                        existing
                    )
                    ===
                    JSON.stringify(
                        value
                    )

            );


        if(
            !exists
        )
        {

            array.push(
                value
            );

        }

    }


}


module.exports =
    MapScriptExtractor;