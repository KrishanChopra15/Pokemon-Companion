/**
 * Pokémon Companion
 * Location Availability Service Test
 *
 * Tests:
 * - Normal accessible locations
 * - Story locked locations
 * - Badge requirements
 * - HM requirements
 * - Post game locations
 */

"use strict";



const LocationAvailabilityService =
    require("../scripts/services/location-availability-service");









//--------------------------------
// Mock location rules
//--------------------------------


const locationRules =
[


    //--------------------------------
    // Viridian Forest
    //--------------------------------


    {
        location:
            "VIRIDIAN_FOREST",

        requirement:
        {

        }

    },








    //--------------------------------
    // Safari Zone
    //--------------------------------


    {
        location:
            "SAFARI_ZONE",


        requirement:
        {

            flags:
            [

                "REACHED_FUCHSIA_CITY"

            ]

        }

    },








    //--------------------------------
    // Seafoam Islands
    //--------------------------------


    {
        location:
            "SEAFOAM_ISLANDS",


        requirement:
        {

            keyItems:
            [

                "HM03"

            ],


            badges:
            [

                "SOUL_BADGE"

            ]

        }

    },








    //--------------------------------
    // Victory Road
    //--------------------------------


    {
        location:
            "VICTORY_ROAD",


        requirement:
        {

            badges:
            [

                "BOULDER_BADGE",

                "CASCADE_BADGE",

                "THUNDER_BADGE",

                "RAINBOW_BADGE",

                "SOUL_BADGE",

                "MARSH_BADGE",

                "VOLCANO_BADGE",

                "EARTH_BADGE"

            ]

        }

    },








    //--------------------------------
    // Cerulean Cave
    //--------------------------------


    {
        location:
            "CERULEAN_CAVE",


        requirement:
        {

            flags:
            [

                "CHAMPION_DEFEATED",

                "NATIONAL_DEX"

            ]

        }

    }


];









//--------------------------------
// Service
//--------------------------------


const locationService =
    new LocationAvailabilityService(

        [],

        locationRules

    );









console.log();

console.log(
    "================================"
);

console.log(
    "Location Availability Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Viridian Forest
//--------------------------------


console.log();

console.log(
    "Viridian Forest:"
);


console.log(

    locationService.isAvailable(

        "VIRIDIAN_FOREST",

        {

            flags:[]

        }

    )

);









//--------------------------------
// Safari Zone locked
//--------------------------------


console.log();

console.log(
    "Safari Zone before Fuchsia:"
);


console.log(

    locationService.isAvailable(

        "SAFARI_ZONE",

        {

            flags:[]

        }

    )

);









//--------------------------------
// Safari Zone unlocked
//--------------------------------


console.log();

console.log(
    "Safari Zone after Fuchsia:"
);


console.log(

    locationService.isAvailable(

        "SAFARI_ZONE",

        {

            flags:
            [

                "REACHED_FUCHSIA_CITY"

            ]

        }

    )

);









//--------------------------------
// Seafoam locked
//--------------------------------


console.log();

console.log(
    "Seafoam Islands before Surf:"
);


console.log(

    locationService.isAvailable(

        "SEAFOAM_ISLANDS",

        {

            badges:
            [

                "BOULDER_BADGE",

                "CASCADE_BADGE"

            ],


            keyItems:[]

        }

    )

);









//--------------------------------
// Victory Road
//--------------------------------


console.log();

console.log(
    "Victory Road before 8 badges:"
);


console.log(

    locationService.isAvailable(

        "VICTORY_ROAD",

        {

            badges:
            [

                "BOULDER_BADGE",

                "CASCADE_BADGE"

            ]

        }

    )

);









//--------------------------------
// Cerulean Cave
//--------------------------------


console.log();

console.log(
    "Cerulean Cave before post game:"
);


console.log(

    locationService.isAvailable(

        "CERULEAN_CAVE",

        {

            flags:[]

        }

    )

);









//--------------------------------
// Cerulean Cave unlocked
//--------------------------------


console.log();

console.log(
    "Cerulean Cave post game:"
);


console.log(

    locationService.isAvailable(

        "CERULEAN_CAVE",

        {

            flags:
            [

                "CHAMPION_DEFEATED",

                "NATIONAL_DEX"

            ]

        }

    )

);









console.log();

console.log(
    "Location Availability Service Tests Completed."
);

console.log();