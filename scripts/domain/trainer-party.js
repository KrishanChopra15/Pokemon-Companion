/**
 * Pokémon Companion
 * Trainer Party Domain Object
 *
 * Represents a trainer's Pokémon party.
 */

"use strict";


class TrainerParty {


    constructor(
        pokemon = []
    ) {

        this.pokemon = pokemon;

    }



    getSize() {

        return this.pokemon.length;

    }



    getHighestLevel() {


        if (this.pokemon.length === 0) {

            return 0;

        }


        return Math.max(
            ...this.pokemon.map(
                pokemon => pokemon.level
            )
        );

    }


}


module.exports = TrainerParty;