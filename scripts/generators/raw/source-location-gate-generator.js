/**
 * Pokémon Companion
 * Source Location Gate Generator
 *
 * Saves source-derived location access facts.
 */

"use strict";

const fs =
    require("fs");

const path =
    require("path");


class SourceLocationGateGenerator
{


    generate(
        gates,
        game
    )
    {

        const file =
            path.join(

                process.cwd(),

                "database",

                "raw",

                game,

                "source-location-gates.json"

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

                gates,

                null,
                4

            )

        );


        console.log();

        console.log(
            "Generated source-derived location gates database."
        );

        console.log(
            `Locations: ${Object.keys(gates).length}`
        );

        console.log();

    }

}


module.exports =
    SourceLocationGateGenerator;
