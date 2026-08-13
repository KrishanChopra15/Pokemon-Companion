"use strict";

class TrainerPokemon {

    constructor(
        species,
        level,
        iv = 0
    ) {

        this.species = species;
        this.level = level;
        this.iv = iv;

    }

}

module.exports = TrainerPokemon;