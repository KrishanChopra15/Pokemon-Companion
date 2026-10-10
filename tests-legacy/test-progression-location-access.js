/**
 * Pokémon Companion
 * Progression Location Access Test
 *
 * Tests:
 * - Progression database loading.
 * - Location access with requirements.
 * - Badge checks.
 */

"use strict";


const ProgressionService =
    require("../scripts/services/progression-service");


const TrainerState =
    require("../scripts/domain/trainer-state");



function testVictoryRoadAccess() {


    console.log();

    console.log(
        "Testing Victory Road progression..."
    );


    const progression =
        new ProgressionService(
            "firered"
        );



    const player =
        new TrainerState();



    //--------------------------------
    // Without badges
    //--------------------------------


    const blocked =
        progression.canUnlock(

            "VICTORY_ROAD_ACCESS",

            player

        );



    console.log(
        "Without badges:",
        blocked
    );




    //--------------------------------
    // Add all badges
    //--------------------------------


    const badges = [

        "BOULDER_BADGE",

        "CASCADE_BADGE",

        "THUNDER_BADGE",

        "RAINBOW_BADGE",

        "SOUL_BADGE",

        "MARSH_BADGE",

        "VOLCANO_BADGE",

        "EARTH_BADGE"

    ];



    for(
        const badge of badges
    ) {

        player.addBadge(
            badge
        );

    }




    const allowed =
        progression.canUnlock(

            "VICTORY_ROAD_ACCESS",

            player

        );



    console.log(
        "With 8 badges:",
        allowed
    );



}





function run() {


    testVictoryRoadAccess();



    console.log();

    console.log(
        "Progression location access test completed."
    );

    console.log();


}



run();