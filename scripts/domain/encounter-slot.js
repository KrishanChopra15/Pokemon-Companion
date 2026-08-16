/**
 * Pokémon Companion
 * Encounter Slot Domain Object
 *
 * Represents a possible wild Pokémon encounter slot.
 */

"use strict";


class EncounterSlot {


    constructor({

        encounterRate = 0,

        minLevel = 1,

        maxLevel = 1


    } = {}) {


        this.encounterRate =
            encounterRate;


        this.minLevel =
            minLevel;


        this.maxLevel =
            maxLevel;


    }





    getLevelRange() {


        if(
            this.minLevel === this.maxLevel
        ){

            return `${this.minLevel}`;

        }


        return `${this.minLevel}-${this.maxLevel}`;


    }





    isFixedLevel() {


        return (

            this.minLevel ===
            this.maxLevel

        );


    }


}


module.exports =
    EncounterSlot;