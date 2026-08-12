/**
 * Pokémon Companion
 * FireRed Build Pipeline Test
 */

"use strict";

const FireRedBuildPipeline = require(
    "../scripts/pipelines/build-firered"
);

try {

    const pipeline = new FireRedBuildPipeline();

    pipeline.run();

}
catch (error) {

    console.error(error);

}