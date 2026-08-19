"use strict";


const AppContainer =
    require("../scripts/app-container");



const app =
    new AppContainer(
        "firered"
    );



const team =
    app.get(
        "teamFlow"
    );


const storage =
    app.get(
        "storageFlow"
    );


const capture =
    app.get(
        "captureFlow"
    );


const inventory =
    app.get(
        "inventoryFlow"
    );





//--------------------------------
// Add 6 Pokemon to team
//--------------------------------

const party = [

    "BULBASAUR",

    "CHARMANDER",

    "SQUIRTLE",

    "PIKACHU",

    "PIDGEY",

    "RATTATA"

];



party.forEach(

    species =>

        team.addToTeam({

            species,

            level:5

        })

);





console.log(
    "Team Size Before:",
    team.getTeam().length
);





//--------------------------------
// Add Pokeball
//--------------------------------

inventory.receiveItem(

    "POKE_BALL",

    1

);





//--------------------------------
// Attempt Capture
//--------------------------------

const result =
    capture.confirmCapture({

        species:
            "MEOWTH",

        level:
            7,

        location:
            "ROUTE_5"

    });





console.log(
    "Capture Success:",
    result.success
);



console.log(
    "Team Added:",
    result.team
);



console.log(
    "Stored:",
    result.storage
);



console.log(
    "Storage Count:",
    storage.getStorage().length
);