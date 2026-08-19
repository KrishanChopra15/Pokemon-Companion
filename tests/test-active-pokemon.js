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


const active =
    app.get(
        "activePokemonFlow"
    );



team.addToTeam({

    species:"CHARMANDER",

    level:5

});



console.log(
    "Active Manager:",
    !!app.get("activePokemonManager")
);


console.log(
    "Active Flow:",
    !!active
);



const result =
    active.selectActive({

        species:"CHARMANDER",

        level:5

    });



console.log(
    "Select:",
    result.success
);



console.log(
    "Pokemon:",
    active.getActive().species
);



console.log(
    "Has Active:",
    active.getStatus().hasActive
);