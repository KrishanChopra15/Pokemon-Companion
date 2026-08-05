module.exports = Object.freeze([

    {
        input: "pokemon.json",
        output: "pokemon-by-type.json",
        label: "Pokémon by Type",

        valuesSelector: pokemon => pokemon.types,

        keySelector: type => type.id
    },

    {
        input: "pokemon.json",
        output: "pokemon-by-ability.json",
        label: "Pokémon by Ability",

        valuesSelector: pokemon => pokemon.abilities,

        keySelector: ability => ability.id
    },

//    {
//
//        input:
//            "pokemon.json",
//
//        output:
//            "pokemon-by-move.json",
//
//        label:
//            "Pokémon by Move",
//
//        valuesSelector:
//            pokemon => pokemon.moves
//
//    },

    {
        input: "moves.json",
        output: "moves-by-type.json",
        label: "Moves by Type",
    
        valuesSelector: move => [move.type],
    
        keySelector: type => type.id
    }

]);