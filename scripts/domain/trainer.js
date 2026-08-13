"use strict";

class Trainer {

    constructor(
        id,
        trainerClass,
        trainerPic,
        encounterMusic,
        trainerName,
        doubleBattle,
        aiFlags,
        party
    ) {

        this.id = id;

        this.trainerClass = trainerClass;

        this.trainerPic = trainerPic;

        this.encounterMusic = encounterMusic;

        this.trainerName = trainerName;

        this.doubleBattle = doubleBattle;

        this.aiFlags = aiFlags;

        this.party = party;

    }

}

module.exports = Trainer;