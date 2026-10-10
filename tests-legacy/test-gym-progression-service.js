/**
 * Pokémon Companion
 * Gym Progression Service Test
 *
 * Tests:
 * - Gym database
 * - Gym lookup
 * - Map access requirements
 * - HM requirements
 * - Key item requirements
 * - Badge progression
 * - Final gym unlock
 */

"use strict";


const GymProgressionService =
    require("../scripts/services/gym-progression-service");


const MapAccessService =
    require("../scripts/services/map-access-service");


const TrainerState =
    require("../scripts/domain/trainer-state");








//--------------------------------
// Services
//--------------------------------


const mapAccess =
    new MapAccessService();



const gyms =
    new GymProgressionService(

        mapAccess

    );



const player =
    new TrainerState();









console.log();

console.log(
    "========================================"
);

console.log(
    "Gym Progression Tests"
);

console.log(
    "========================================"
);









//--------------------------------
// Database
//--------------------------------


console.log();

console.log(
    "Total gyms:"
);


console.log(
    gyms.getGymCount()
);







console.log();

console.log(
    "All gyms:"
);


console.log(
    gyms.getAllGyms()
);









//--------------------------------
// Brock
//--------------------------------


console.log();

console.log(
    "Brock without Pokedex:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_BROCK",

        player

    )

);






console.log();

console.log(
    "Giving Pokedex..."
);


player.addStoryFlag(
    "POKEDEX_RECEIVED"
);





console.log();

console.log(
    "Brock available:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_BROCK",

        player

    )

);






console.log();

console.log(
    "Defeating Brock..."
);


player.completeBattle(
    "TRAINER_LEADER_BROCK"
);


player.addBadge(
    "BOULDER_BADGE"
);









//--------------------------------
// Misty
//--------------------------------


console.log();

console.log(
    "Misty without Cerulean:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_MISTY",

        player

    )

);






console.log();

console.log(
    "Visiting Cerulean:"
);


player.visitLocation(
    "CERULEAN_CITY"
);





console.log();

console.log(
    "Misty available:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_MISTY",

        player

    )

);









//--------------------------------
// Lt Surge
//--------------------------------


console.log();

console.log(
    "Lt Surge without Cut:"
);


player.visitLocation(
    "VERMILION_CITY"
);



console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_LT_SURGE",

        player

    )

);







console.log();

console.log(
    "Getting Cut:"
);


player.addHM(
    "CUT"
);





console.log();

console.log(
    "Lt Surge with Cut:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_LT_SURGE",

        player

    )

);









//--------------------------------
// Erika
//--------------------------------


console.log();

console.log(
    "Erika with Cut:"
);


player.visitLocation(
    "CELADON_CITY"
);



console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_ERIKA",

        player

    )

);









//--------------------------------
// Sabrina
//--------------------------------


console.log();

console.log(
    "Sabrina before Silph Co:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_SABRINA",

        player

    )

);







console.log();

console.log(
    "Completing Silph Co:"
);


player.addStoryFlag(
    "SILPH_CO_COMPLETED"
);






console.log();

console.log(
    "Sabrina after Silph Co:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_SABRINA",

        player

    )

);









//--------------------------------
// Blaine
//--------------------------------


console.log();

console.log(
    "Blaine without Surf:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_BLAINE",

        player

    )

);







console.log();

console.log(
    "Adding Surf:"
);


player.addHM(
    "SURF"
);





console.log();

console.log(
    "Blaine without Secret Key:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_BLAINE",

        player

    )

);







console.log();

console.log(
    "Getting Secret Key:"
);


player.addKeyItem(
    "SECRET_KEY"
);





console.log();

console.log(
    "Blaine available:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_BLAINE",

        player

    )

);









//--------------------------------
// Giovanni
//--------------------------------


console.log();

console.log(
    "Giovanni before 7 badges:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_GIOVANNI",

        player

    )

);








console.log();

console.log(
    "Adding remaining badges..."
);


const badges = [

    "CASCADE_BADGE",

    "THUNDER_BADGE",

    "RAINBOW_BADGE",

    "SOUL_BADGE",

    "MARSH_BADGE",

    "VOLCANO_BADGE"

];



for(
    const badge of badges
)
{

    player.addBadge(
        badge
    );

}






console.log();

console.log(
    "Completing Cinnabar Gym:"
);


player.addStoryFlag(
    "CINNABAR_GYM_COMPLETED"
);








console.log();

console.log(
    "Giovanni after all requirements:"
);


console.log(

    gyms.canChallengeGym(

        "TRAINER_LEADER_GIOVANNI",

        player

    )

);









//--------------------------------
// Final state
//--------------------------------


console.log();

console.log(
    "Available gyms:"
);


console.log(

    gyms.getAvailableGyms(
        player
    )

);







console.log();

console.log(
    "Completed gyms:"
);


console.log(

    gyms.getCompletedGymCount(
        player
    )

);







console.log();

console.log(
    "Gym Progression Tests Completed."
);

console.log();