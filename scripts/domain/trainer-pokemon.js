/**
 * Pokémon Companion
 * Trainer Pokémon Domain Object
 *
 * Represents a Pokémon used by a trainer.
 *
 * Responsibilities:
 * - Store Pokémon species reference.
 * - Store level and IV data.
 * - Store held item.
 * - Store moves.
 *
 * Does NOT:
 * - Resolve references.
 * - Read JSON.
 * - Parse ROM data.
 */

"use strict";


class TrainerPokemon {


    constructor(data = {}) {


        this.speciesId =
            data.speciesId || null;



        this.species =
            data.species || null;



        this.level =
            data.level || 0;



        this.iv =
            data.iv || 0;



        this.heldItem =
            data.heldItem || null;



        this.moves =
            data.moves || [];


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





    getMoveCount() {


        return this.moves.length;


    }





    getSpecies() {


        return this.species;


    }


}


module.exports =
    TrainerPokemon;