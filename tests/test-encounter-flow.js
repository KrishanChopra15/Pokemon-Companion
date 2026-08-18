"use strict";


const AppContainer =
    require("../scripts/app-container");



const container =
    new AppContainer();



const encounterFlow =
    container.get(
        "encounterFlow"
    );



console.log(
    "Encounter Flow:",
    Boolean(encounterFlow)
);



const result =
    encounterFlow.generateEncounter(
        "MAP_ROUTE1"
    );



console.log(
    "Encounter:",
    result.success
);


if(result.success)
{

    console.log(
        "Pokemon:",
        result.encounter.species
    );

}