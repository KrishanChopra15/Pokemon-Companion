/**
 * Pokémon Companion
 * Trainer Domain Object
 *
 * Represents a trainer in a Pokémon game.
 */

"use strict";


class Trainer {


    constructor(data = {}) {


        this.id =
            data.id || null;


        this.trainerType =
            data.trainerType || null;


        this.trainerClass =
            data.trainerClass || null;


        this.trainerPic =
            data.trainerPic || null;


        this.encounterMusic =
            data.encounterMusic || null;


        this.trainerName =
            data.trainerName || null;


        this.doubleBattle =
            data.doubleBattle || false;


        this.aiFlags =
            data.aiFlags || [];


        this.party =
            data.party || null;


    }



    getPartySize() {


        return this.party
            ? this.party.getSize()
            : 0;


    }



    getHighestPokemonLevel() {


        return this.party
            ? this.party.getHighestLevel()
            : 0;


    }



    hasParty() {


        return this.party !== null;


    }


}


module.exports = Trainer;