/**
 * Pokémon Companion
 * Pokémon Species
 *
 * Represents a Pokémon species.
 *
 * This is an immutable domain object.
 */

"use strict";

class PokemonSpecies {

    /**
     * Create a Pokémon Species.
     *
     * @param {Object} options
     */
    constructor({

        id,
        nationalDexNumber,
        name,
        generation,

        baseHP,
        baseAttack,
        baseDefense,
        baseSpeed,
        baseSpAttack,
        baseSpDefense,

        type1,
        type2,

        catchRate,
        expYield,

        evYieldHP,
        evYieldAttack,
        evYieldDefense,
        evYieldSpeed,
        evYieldSpAttack,
        evYieldSpDefense,

        itemCommon,
        itemRare,

        genderRatio,
        eggCycles,
        friendship,
        growthRate,

        eggGroup1,
        eggGroup2,

        ability1,
        ability2,

        safariZoneFleeRate,

        bodyColor,
        noFlip

    }) {

        this.id = id;
        this.nationalDexNumber = nationalDexNumber;
        this.name = name;
        this.generation = generation;

        this.baseHP = baseHP;
        this.baseAttack = baseAttack;
        this.baseDefense = baseDefense;
        this.baseSpeed = baseSpeed;
        this.baseSpAttack = baseSpAttack;
        this.baseSpDefense = baseSpDefense;

        this.type1 = type1;
        this.type2 = type2;

        this.catchRate = catchRate;
        this.expYield = expYield;

        this.evYieldHP = evYieldHP;
        this.evYieldAttack = evYieldAttack;
        this.evYieldDefense = evYieldDefense;
        this.evYieldSpeed = evYieldSpeed;
        this.evYieldSpAttack = evYieldSpAttack;
        this.evYieldSpDefense = evYieldSpDefense;

        this.itemCommon = itemCommon;
        this.itemRare = itemRare;
          
        this.genderRatio = genderRatio;
        this.eggCycles = eggCycles;
        this.friendship = friendship;
        this.growthRate = growthRate;
          
        this.eggGroup1 = eggGroup1;
        this.eggGroup2 = eggGroup2;
          
        this.ability1 = ability1;
        this.ability2 = ability2;
          
        this.safariZoneFleeRate = safariZoneFleeRate;

        this.bodyColor = bodyColor;
        this.noFlip = noFlip;

        Object.freeze(this);

    }

}

module.exports = PokemonSpecies;