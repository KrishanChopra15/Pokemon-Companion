"use strict";

class PokemonMove {

    constructor({
        id,
        name,
        effect,
        power,
        type,
        accuracy,
        pp,
        secondaryEffectChance,
        target,
        priority,
        flags,
    }) {

        this.id = id;
        this.name = name;

        this.effect = effect;
        this.power = power;
        this.type = type;
        this.accuracy = accuracy;
        this.pp = pp;
        this.secondaryEffectChance = secondaryEffectChance;
        this.target = target;
        this.priority = priority;
        this.flags = flags;

        Object.freeze(this);

    }

}

module.exports = PokemonMove;