/**
 * Pokémon Companion
 * Location Graph Generator
 */

"use strict";

const fs = require("fs");
const path = require("path");


class LocationGraphGenerator {


    generate(
        graph,
        game
    ) {


        const file =
            path.join(
                process.cwd(),
                "database",
                "raw",
                game,
                "location-graph.json"
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
                graph,
                null,
                4
            )
        );



        console.log();

        console.log(
            "Generated location graph database."
        );


        console.log(
            `Locations: ${Object.keys(graph).length}`
        );


    }


}


module.exports = LocationGraphGenerator;