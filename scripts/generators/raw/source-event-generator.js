/**
 * Pokémon Companion
 * Source Event Generator
 *
 * Saves the raw event scripts extracted directly from the
 * reference game's source data.
 */

"use strict";

const fs =
    require("fs");

const path =
    require("path");


class SourceEventGenerator
{


    generate(
        events,
        game
    )
    {

        const file =
            path.join(

                process.cwd(),

                "database",

                "raw",

                game,

                "events.json"

            );


        fs.mkdirSync(

            path.dirname(file),

            {
                recursive:
                    true
            }

        );


        fs.writeFileSync(

            file,

            JSON.stringify(

                events,

                null,
                4

            )

        );


        console.log();

        console.log(
            "Generated source-derived event database."
        );

        console.log(
            `Events: ${Object.keys(events).length}`
        );

        console.log();

    }

}


module.exports =
    SourceEventGenerator;
