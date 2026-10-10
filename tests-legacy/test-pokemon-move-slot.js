"use strict";


const PokemonMoveSlot =
require("../scripts/domain/pokemon-move-slot");



console.log();


console.log(
"==============================="
);

console.log(
"Pokemon Move Slot Test"
);

console.log(
"==============================="
);



const ember =
new PokemonMoveSlot({

    constant:"MOVE_EMBER",

    currentPP:25,

    maxPP:25

});



console.log();


console.log(
"Initial:"
);


console.log(
ember
);



ember.usePP();


ember.usePP();



console.log();


console.log(
"After using Ember twice:"
);


console.log(
ember
);



ember.restorePP();



console.log();


console.log(
"After restore:"
);


console.log(
ember
);



console.log();


console.log(
"Completed."
);