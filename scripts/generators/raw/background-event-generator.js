/**
 * Pokémon Companion
 * Background Event Generator
 *
 * Generates the raw background event database.
 *
 * Responsibilities:
 * - Convert extracted background events into a raw database.
 * - Group events by map.
 * - Preserve sign events.
 * - Preserve hidden item events.
 * - Preserve positions.
 * - Preserve facing directions.
 * - Preserve scripts.
 * - Preserve item references.
 * - Preserve collection flags.
 * - Write the generated raw database.
 *
 * Does NOT:
 * - Resolve event scripts.
 * - Execute events.
 * - Classify events.
 * - Resolve progression.
 */

"use strict";


const fs =
    require("fs");


const path =
    require("path");



class BackgroundEventGenerator
{


    //--------------------------------
    // Generate background event database
    //--------------------------------

    generate(
        events,
        game
    )
    {

        if(
            !Array.isArray(
                events
            )
        )
        {

            throw new TypeError(
                "Background event data must be an array."
            );

        }


        if(
            typeof game !==
                "string"
            ||
            !game
        )
        {

            throw new TypeError(
                "Game must be a non-empty string."
            );

        }


        const database =
            {};


        //--------------------------------
        // Group events by map
        //--------------------------------

        for(
            const event of
                events
        )
        {

            if(
                !event
                ||
                typeof event !==
                    "object"
            )
            {

                continue;

            }


            const map =
                event.map
                ||
                null;


            if(
                !map
            )
            {

                continue;

            }


            if(
                !database[map]
            )
            {

                database[map] =
                    [];

            }


            database[map].push(

                this.normalizeEvent(
                    event
                )

            );

        }


        //--------------------------------
        // Sort events consistently
        //--------------------------------

        for(
            const map of
                Object.keys(
                    database
                )
        )
        {

            database[map].sort(

                (
                    a,
                    b
                ) =>

                    (
                        a.position?.y
                        ||
                        0
                    )
                    -
                    (
                        b.position?.y
                        ||
                        0
                    )

                    ||

                    (
                        a.position?.x
                        ||
                        0
                    )
                    -
                    (
                        b.position?.x
                        ||
                        0
                    )

            );

        }


        //--------------------------------
        // Write database
        //--------------------------------

        const outputPath =
            path.join(

                __dirname,

                "../../../database/raw",

                game,

                "background-events.json"

            );


        fs.mkdirSync(

            path.dirname(
                outputPath
            ),

            {
                recursive:
                    true
            }

        );


        fs.writeFileSync(

            outputPath,

            JSON.stringify(

                database,

                null,

                4

            ),

            "utf8"

        );


        //--------------------------------
        // Statistics
        //--------------------------------

        const maps =
            Object.keys(
                database
            );


        const totalEvents =
            Object.values(
                database
            )
            .reduce(

                (
                    total,
                    mapEvents
                ) =>

                    total +
                    mapEvents.length,

                0

            );


        const signEvents =
            Object.values(
                database
            )
            .flat()
            .filter(

                event =>

                    event.eventType ===
                    "BG_SIGN_EVENT"

            )
            .length;


        const hiddenItemEvents =
            Object.values(
                database
            )
            .flat()
            .filter(

                event =>

                    event.eventType ===
                    "BG_HIDDEN_ITEM_EVENT"

            )
            .length;


        console.log();


        console.log(
            "Generated background event database."
        );


        console.log(
            `Game: ${game}`
        );


        console.log(
            `Locations: ${maps.length}`
        );


        console.log(
            `Background events: ${totalEvents}`
        );


        console.log(
            `Sign events: ${signEvents}`
        );


        console.log(
            `Hidden item events: ${hiddenItemEvents}`
        );


        console.log();


        return database;

    }


    //--------------------------------
    // Normalize one background event
    //--------------------------------

    normalizeEvent(
        event
    )
    {

        //--------------------------------
        // Sign event
        //--------------------------------

        if(
            event.eventType ===
            "BG_SIGN_EVENT"
        )
        {

            return {

                eventType:
                    "BG_SIGN_EVENT",

                position:
                {

                    x:
                        Number(
                            event.position?.x
                            ||
                            0
                        ),

                    y:
                        Number(
                            event.position?.y
                            ||
                            0
                        ),

                    elevation:
                        Number(
                            event.position?.elevation
                            ||
                            0
                        )

                },

                facing:
                    event.facing
                    ||
                    null,

                script:
                    event.script
                    ||
                    null

            };

        }


        //--------------------------------
        // Hidden item event
        //--------------------------------

        if(
            event.eventType ===
            "BG_HIDDEN_ITEM_EVENT"
        )
        {

            return {

                eventType:
                    "BG_HIDDEN_ITEM_EVENT",

                position:
                {

                    x:
                        Number(
                            event.position?.x
                            ||
                            0
                        ),

                    y:
                        Number(
                            event.position?.y
                            ||
                            0
                        ),

                    elevation:
                        Number(
                            event.position?.elevation
                            ||
                            0
                        )

                },

                item:
                    event.item
                    ||
                    "ITEM_NONE",

                flag:
                    event.flag
                    ||
                    null

            };

        }


        //--------------------------------
        // Unknown background event
        //--------------------------------

        return {

            eventType:
                event.eventType
                ||
                "UNKNOWN",

            position:
                event.position
                ||
                null

        };

    }


}


module.exports =
    BackgroundEventGenerator;