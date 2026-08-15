/**
 * Pokémon Companion
 * Field Obstacle Generator
 */

"use strict";

const fs = require("fs");
const path = require("path");


class FieldObstacleGenerator {


    generate(
        obstacles,
        game
    ) {


        const file =
            path.join(
                process.cwd(),
                "database",
                "raw",
                game,
                "field-obstacles.json"
            );


        fs.mkdirSync(
            path.dirname(file),
            {
                recursive:true
            }
        );


        fs.writeFileSync(
            file,
            JSON.stringify(
                obstacles,
                null,
                4
            )
        );


        console.log();

        console.log(
            "Generated field obstacle database."
        );


        console.log(
            `Locations: ${Object.keys(obstacles).length}`
        );

        console.log();

    }


}


module.exports = FieldObstacleGenerator;