/**
 * Pokémon Companion
 * Trainer Pokémon Domain Object
 *
 * Represents a Pokémon used by a trainer.
 */

"use strict";


class TrainerPokemon {


    constructor(
        species,
        level,
        iv = 0,
        heldItem = null,
        moves = []
    ) {

        this.species = species;

        this.level = level;

        this.iv = iv;

        this.heldItem = heldItem;

        this.moves = moves;

    }



    hasHeldItem() {

        return this.heldItem !== null;

    }



    hasMoves() {

        return this.moves.length > 0;

    }



    getLevel() {

        return this.level;

    }


}


module.exports = TrainerPokemon;