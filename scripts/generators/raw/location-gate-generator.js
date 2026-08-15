/**
 * Pokémon Companion
 * Location Gate Generator
 *
 * Generates raw location gate database.
 *
 * Responsibilities:
 * - Receive extracted location gates.
 * - Save JSON database.
 *
 * Does NOT:
 * - Parse source files.
 * - Determine progression.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationGateGenerator {


    generate(gates, game) {


        const file =
            path.join(

                process.cwd(),

                "database",

                "raw",

                game,

                "location-gates.json"

            );



        fs.mkdirSync(

            path.dirname(file),

            {
                recursive: true
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
            "Generated location gates database."
        );


        console.log(
            `Locations: ${Object.keys(gates).length}`
        );


        console.log();

    }


}


module.exports = LocationGateGenerator;