/**
 * Pokémon Companion
 * FireRed Build Pipeline Test
 */

"use strict";

const FireRedBuildPipeline = require(
    "../scripts/pipelines/build-firered"
);

const locations =
require("../database/generated/firered/locations.json");


console.log(
    "Locations:",
    Object.keys(locations).length
);

try {

    const pipeline = new FireRedBuildPipeline();

    pipeline.run();

}
catch (error) {

    console.error(error);

}