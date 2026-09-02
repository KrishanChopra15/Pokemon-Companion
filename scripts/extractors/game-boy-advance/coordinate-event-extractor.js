/**
 * Pokémon Companion
 * Coordinate Event Extractor
 *
 * Extracts coordinate-triggered map events.
 *
 * Responsibilities:
 * - Read events.inc files.
 * - Extract coord_event declarations.
 * - Preserve map name.
 * - Preserve coordinates.
 * - Preserve elevation.
 * - Preserve controlling variable.
 * - Preserve controlling value.
 * - Preserve target script.
 *
 * Does NOT:
 * - Execute coordinate events.
 * - Evaluate runtime conditions.
 * - Resolve script calls or jumps.
 * - Classify NPCs.
 * - Determine progression.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class CoordinateEventExtractor
{


    //--------------------------------
    // Extract all coordinate events
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


            const events =
                this.extractFile(

                    file,

                    map

                );


            if(
                events.length > 0
            )
            {

                results[map] =
                    events;

            }

        }


        return results;

    }


    //--------------------------------
    // Extract coordinate events
    // from one events.inc file
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


        const events =
            [];


        //--------------------------------
        // coord_event
        //--------------------------------

        const regex =
            /^\s*coord_event\s+(\d+),\s*(\d+),\s*(\d+),\s*([A-Za-z0-9_]+),\s*([A-Za-z0-9_]+),\s*([A-Za-z0-9_]+)\s*$/gm;


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

            events.push({

                map,

                type:
                    "COORD_EVENT",

                position:
                {

                    x:
                        Number(
                            match[1]
                        ),

                    y:
                        Number(
                            match[2]
                        ),

                    elevation:
                        Number(
                            match[3]
                        )

                },

                variable:
                    match[4],

                value:
                    match[5],

                target:
                    match[6]

            });

        }


        return events;

    }


}


module.exports =
    CoordinateEventExtractor;