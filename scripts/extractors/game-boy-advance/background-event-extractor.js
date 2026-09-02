/**
 * Pokémon Companion
 * Background Event Extractor
 *
 * Extracts map background events.
 *
 * Responsibilities:
 * - Read events.inc files.
 * - Extract sign events.
 * - Extract hidden item events.
 * - Preserve positions.
 * - Preserve facing direction.
 * - Preserve item references.
 * - Preserve hide/collection flags.
 *
 * Does NOT:
 * - Resolve event logic.
 * - Resolve dialogue.
 * - Resolve progression.
 * - Execute scripts.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class BackgroundEventExtractor
{


    //--------------------------------
    // Extract all background events
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


        const events =
            [];


        const maps =
            fs.readdirSync(

                mapsPath

            );


        for(
            const map of
                maps
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


            const data =
                this.extractFile(

                    file,

                    map

                );


            events.push(
                ...data
            );

        }


        return events;

    }


    //--------------------------------
    // Extract background events
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
        // Background sign events
        //--------------------------------
        //
        // bg_sign_event syntax:
        //
        // bg_sign_event
        //     x,
        //     y,
        //     elevation,
        //     facing_dir,
        //     script
        //--------------------------------

        const signRegex =
            /bg_sign_event\s+(-?\d+),\s*(-?\d+),\s*(\d+),\s*([A-Z0-9_]+),\s*([A-Za-z0-9_]+)/g;


        let match;


        while(
            (
                match =
                    signRegex.exec(
                        content
                    )
            )
        )
        {

            events.push({

                map,


                eventType:
                    "BG_SIGN_EVENT",


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


                facing:
                    match[4],


                script:
                    match[5]

            });

        }


        //--------------------------------
        // Background hidden item events
        //--------------------------------
        //
        // bg_hidden_item_event syntax:
        //
        // bg_hidden_item_event
        //     x,
        //     y,
        //     elevation,
        //     item,
        //     flag
        //--------------------------------

        const hiddenItemRegex =
            /bg_hidden_item_event\s+(-?\d+),\s*(-?\d+),\s*(\d+),\s*([A-Z0-9_]+),\s*(FLAG_[A-Z0-9_]+)/g;


        while(
            (
                match =
                    hiddenItemRegex.exec(
                        content
                    )
            )
        )
        {

            events.push({

                map,


                eventType:
                    "BG_HIDDEN_ITEM_EVENT",


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


                item:
                    match[4],


                flag:
                    match[5]

            });

        }


        return events;

    }


}


module.exports =
    BackgroundEventExtractor;