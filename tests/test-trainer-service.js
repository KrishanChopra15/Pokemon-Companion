/**
 * Pokémon Companion
 * Trainer Service Test
 *
 * Tests:
 * - Trainer lookup
 * - Gym leader lookup
 * - Trainer party retrieval
 * - Battle trainer creation
 * - Trainer type search
 */

"use strict";



const TrainerService =
    require("../scripts/services/trainer-service");









//--------------------------------
// Mock trainer database
//--------------------------------


const trainers =
[


    {

        name:
            "MISTY",


        type:
            "GYM_LEADER",


        badge:
            "CASCADE_BADGE",


        party:
        [

            {

                species:
                    "STARYU",

                level:
                    18,

                moves:
                [

                    "WATER_GUN"

                ]

            },


            {

                species:
                    "STARMIE",

                level:
                    21,

                moves:
                [

                    "BUBBLE_BEAM"

                ]

            }


        ]

    },





    {

        name:
            "BROCK",


        type:
            "GYM_LEADER",


        badge:
            "BOULDER_BADGE",


        party:
        [

            {

                species:
                    "GEODUDE",

                level:
                    12,

                moves:
                [

                    "TACKLE"

                ]

            },


            {

                species:
                    "ONIX",

                level:
                    14,

                moves:
                [

                    "ROCK_THROW"

                ]

            }


        ]

    },





    {

        name:
            "YOUNGSTER_JOE",


        type:
            "TRAINER",


        party:
        [

            {

                species:
                    "RATTATA",

                level:
                    8

            }

        ]

    }


];









//--------------------------------
// Service
//--------------------------------


const trainerService =
    new TrainerService(

        trainers

    );









console.log();

console.log(
    "================================"
);

console.log(
    "Trainer Service Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Get trainer
//--------------------------------


console.log();

console.log(
    "Getting Misty:"
);


console.log(

    trainerService.getTrainer(

        "MISTY"

    )

);









//--------------------------------
// Gym leader lookup
//--------------------------------


console.log();

console.log(
    "Getting Brock gym leader:"
);


console.log(

    trainerService.getGymLeader(

        "BROCK"

    )

);









//--------------------------------
// Trainer party
//--------------------------------


console.log();

console.log(
    "Misty party:"
);


console.log(

    trainerService.getParty(

        "MISTY"

    )

);









//--------------------------------
// Battle trainer
//--------------------------------


console.log();

console.log(
    "Creating battle trainer:"
);


console.log(

    trainerService.createBattleTrainer(

        "MISTY"

    )

);









//--------------------------------
// Missing trainer
//--------------------------------


console.log();

console.log(
    "Missing trainer:"
);


console.log(

    trainerService.getTrainer(

        "GIOVANNI"

    )

);









//--------------------------------
// Type search
//--------------------------------


console.log();

console.log(
    "Gym leaders:"
);


console.log(

    trainerService.getByType(

        "GYM_LEADER"

    )

);









//--------------------------------
// Count
//--------------------------------


console.log();

console.log(
    "Trainer count:"
);


console.log(

    trainerService.count()

);









console.log();

console.log(
    "Trainer Service Tests Completed."
);

console.log();