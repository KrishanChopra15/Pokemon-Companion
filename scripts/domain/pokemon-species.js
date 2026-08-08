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

        Object.freeze(this);

    }

}

module.exports = PokemonSpecies;