/**
 * Pokémon Companion
 * Full Application Container Test
 */

"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer();



const services = [

    "pokemonDatabase",

    "trainerDatabase",

    "locationDatabase",

    "gymDatabase",


    "progression",

    "progressionRequirement",

    "gymProgression",

    "storyProgression",


    "locationGraph",

    "locationGate",

    "fieldObstacle",

    "worldState",

    "worldProgression",

    "objective",


    "gym",

    "gymLocation",

    "gymReward",


    "locationAccess",

    "locationAnalysis",

    "locationAvailability",

    "mapAccess",


    "trainerService",

    "battle",

    "battleAI",

    "battleEngine",


    "moveExecution",

    "statusEffect",

    "pokemonSwitch",


    "captureService",

    "wildBattleService",


    "eventService",

    "eventRewardService",

    "rewardService",

    "storyEventService",


    "npcService",

    "npcAvailability",

    "npcInteraction",

    "dialogue",


    "pokemonAvailability",

    "pokemonObtainability",

    "teamRecommendation",

    "pokemonExplanation",

    "pokemonSourceResolver",

    "pokemonTracker",


    "starterSelection",


    "trainerAnalysis",

    "trainerDifficulty",

    "trainerRecommendation",


    "evolutionRequirement",

    "growthRate",

    "pokemonProgression"

];





let passed = 0;



for(
    const service of services
)
{

    const exists =
        Boolean(
            app.get(service)
        );


    console.log(
        `${service}:`,
        exists
    );


    if(exists)
    {
        passed++;
    }

}



console.log(
    `\nPassed ${passed}/${services.length} services`
);