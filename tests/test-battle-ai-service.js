/**
 * Pokémon Companion
 * Battle AI Service Test
 *
 * Tests:
 * - Move selection
 * - Move evaluation
 * - Difficulty levels
 * - AI randomness
 * - Switching decisions
 * - Switch selection
 * - Type matchup evaluation
 * - Battle prediction
 */

"use strict";



const BattleAIService =
    require("../scripts/services/battle-ai-service");









//--------------------------------
// Service
//--------------------------------


const battleAI =
    new BattleAIService();









//--------------------------------
// Mock Pokemon
//--------------------------------


const charmander =
{

    species:
        "CHARMANDER",

    level:
        10,

    hp:
        35,

    type:
        "FIRE"

};





const geodude =
{

    species:
        "GEODUDE",

    level:
        12,

    hp:
        40,

    type:
        "ROCK"

};





const squirtle =
{

    species:
        "SQUIRTLE",

    level:
        15,

    hp:
        45,

    type:
        "WATER"

};









//--------------------------------
// Mock moves
//--------------------------------


const moves =
[

    {

        name:
            "TACKLE",

        power:
            40,

        accuracy:
            100

    },


    {

        name:
            "EMBER",

        power:
            40,

        accuracy:
            100,

        effectiveness:
            2

    },


    {

        name:
            "TAIL_WHIP",

        power:
            0,

        accuracy:
            100

    }


];









console.log();

console.log(
    "================================"
);

console.log(
    "Battle AI Tests"
);

console.log(
    "================================"
);









//--------------------------------
// Best move
//--------------------------------


console.log();

console.log(
    "Best move:"
);


console.log(

    battleAI.getBestMove(

        charmander,

        geodude,

        moves

    )

);









//--------------------------------
// Move evaluation
//--------------------------------


console.log();

console.log(
    "Move scores:"
);



for(
    const move of moves
)
{

    console.log(

        move.name,

        battleAI.evaluateMove(

            charmander,

            geodude,

            move

        )

    );

}









//--------------------------------
// Difficulty tests
//--------------------------------


console.log();

console.log(
    "Normal difficulty choice:"
);


console.log(

    battleAI.chooseMove(

        charmander,

        geodude,

        moves,

        "NORMAL"

    )

);







console.log();

console.log(
    "Hard difficulty choice:"
);


console.log(

    battleAI.chooseMove(

        charmander,

        geodude,

        moves,

        "HARD"

    )

);







console.log();

console.log(
    "Easy difficulty choice:"
);


console.log(

    battleAI.chooseMove(

        charmander,

        geodude,

        moves,

        "EASY"

    )

);









//--------------------------------
// Difficulty data
//--------------------------------


console.log();

console.log(
    "Difficulty settings:"
);


console.log(

    battleAI.getDifficulty(

        "HARD"

    )

);









//--------------------------------
// Type matchup
//--------------------------------


console.log();

console.log(
    "Fire vs Grass:"
);


console.log(

    battleAI.typeAdvantage(

        "FIRE",

        "GRASS"

    )

);







console.log();

console.log(
    "Water vs Electric:"
);


console.log(

    battleAI.typeAdvantage(

        "WATER",

        "ELECTRIC"

    )

);









//--------------------------------
// Matchup evaluation
//--------------------------------


console.log();

console.log(
    "Charmander vs Geodude matchup:"
);


console.log(

    battleAI.evaluateMatchup(

        charmander,

        geodude

    )

);









//--------------------------------
// Battle prediction
//--------------------------------


const playerTeam =
[

    charmander,

    squirtle

];





const opponentTeam =
[

    geodude

];







console.log();

console.log(
    "Battle prediction:"
);


console.log(

    battleAI.predictBattle(

        playerTeam,

        opponentTeam

    )

);









//--------------------------------
// Switch check
//--------------------------------


console.log();

console.log(
    "Should switch healthy Pokemon:"
);


console.log(

    battleAI.shouldSwitch(

        charmander

    )

);









const faintedPokemon =
{

    species:
        "CHARMANDER",

    hp:
        0

};







console.log();

console.log(
    "Should switch fainted Pokemon:"
);


console.log(

    battleAI.shouldSwitch(

        faintedPokemon

    )

);









//--------------------------------
// Choose switch
//--------------------------------


const team =
[

    {

        species:
            "CHARMANDER",

        hp:
            0

    },


    {

        species:
            "PIKACHU",

        hp:
            40

    },


    {

        species:
            "SQUIRTLE",

        hp:
            30

    }

];









console.log();

console.log(
    "Choosing replacement:"
);


console.log(

    battleAI.chooseSwitch(

        team

    )

);









console.log();

console.log(
    "Battle AI Tests Completed."
);

console.log();