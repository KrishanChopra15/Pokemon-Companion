/**
 * Pokémon Companion
 * Trainer Domain Object
 *
 * Represents a trainer in a Pokémon game.
 */

"use strict";


class Trainer {


    constructor(
        id,
        trainerType,
        trainerClass,
        trainerPic,
        encounterMusic,
        trainerName,
        doubleBattle,
        aiFlags,
        party
    ) {


        this.id = id;

        this.trainerType = trainerType;

        this.trainerClass = trainerClass;

        this.trainerPic = trainerPic;

        this.encounterMusic = encounterMusic;

        this.trainerName = trainerName;

        this.doubleBattle = doubleBattle;

        this.doubleBattle = doubleBattle;

        this.aiFlags = aiFlags;

        this.party = party;

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


}


module.exports = Trainer;