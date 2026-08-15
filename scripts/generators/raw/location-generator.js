/**
 * Pokémon Companion
 * Location Generator
 *
 * Generates raw location metadata database.
 *
 * Responsibilities:
 * - Receive extracted locations.
 * - Convert location objects into JSON.
 * - Save raw database.
 *
 * Does NOT:
 * - Parse source files.
 * - Extract ROM data.
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationGenerator {


    /**
     * Generate location database.
     *
     * @param {Array} locations
     */
    generate(locations) {


        const output = {};



        for (const location of locations) {


            output[location.id] = {


                id:
                    location.id,


                folder:
                    location.folder,


                name:
                    location.name,


                region:
                    location.region,


                mapType:
                    location.mapType,


                floor:
                    location.floor,


                music:
                    location.music


            };

        }



        const file =
            path.join(

                process.cwd(),

                "database",

                "raw",

                "firered",

                "location-metadata.json"

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
                output,
                null,
                4
            )

        );



        console.log();

        console.log(
            "Generated location metadata database."
        );

        console.log(
            `Locations: ${Object.keys(output).length}`
        );

        console.log();

    }


}


module.exports = LocationGenerator;