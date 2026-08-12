/**
 * Pokémon Companion
 * Species Info Parser
 *
 * Parses species_info.h from pokefirered.
 */

"use strict";

class SpeciesInfoParser {

    parse(source) {

        const species = [];

        const regex =
            /\[SPECIES_([A-Z0-9_]+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;

        let match;

        let id = 0;


        while ((match = regex.exec(source)) !== null) {

            const constant = `SPECIES_${match[1]}`;

            const block = match[2];


            const data = {

                id,

                constant,

                name: null,

                generation: 1,

                baseHP: this.value(block, "baseHP"),
                baseAttack: this.value(block, "baseAttack"),
                baseDefense: this.value(block, "baseDefense"),
                baseSpeed: this.value(block, "baseSpeed"),
                baseSpAttack: this.value(block, "baseSpAttack"),
                baseSpDefense: this.value(block, "baseSpDefense"),

                type1: this.type(block, 0),
                type2: this.type(block, 1),

                catchRate: this.value(block, "catchRate"),
                expYield: this.value(block, "expYield"),

                evYieldHP: this.value(block, "evYield_HP"),
                evYieldAttack: this.value(block, "evYield_Attack"),
                evYieldDefense: this.value(block, "evYield_Defense"),
                evYieldSpeed: this.value(block, "evYield_Speed"),
                evYieldSpAttack: this.value(block, "evYield_SpAttack"),
                evYieldSpDefense: this.value(block, "evYield_SpDefense"),

                itemCommon: this.constant(block, "itemCommon"),
                itemRare: this.constant(block, "itemRare"),

                genderRatio: this.raw(block, "genderRatio"),

                eggCycles: this.value(block, "eggCycles"),

                friendship: this.value(block, "friendship"),

                growthRate: this.constant(
                    block,
                    "growthRate"
                ),

                eggGroup1: this.constant(
                    block,
                    "eggGroups",
                    0
                ),

                eggGroup2: this.constant(
                    block,
                    "eggGroups",
                    1
                ),

                ability1: this.constant(
                    block,
                    "abilities",
                    0
                ),

                ability2: this.constant(
                    block,
                    "abilities",
                    1
                ),

                safariZoneFleeRate:
                    this.value(block, "safariZoneFleeRate"),

                bodyColor:
                    this.constant(block, "bodyColor"),

                noFlip:
                    this.raw(block, "noFlip")

            };


            species.push(data);

            id++;

        }


        return species;

    }



    value(block, field) {

        const regex =
            new RegExp(
                `\\.${field}\\s*=\\s*([0-9]+)`
            );


        const match = block.match(regex);

        return match
            ? Number(match[1])
            : 0;

    }



    raw(block, field) {

        const regex =
            new RegExp(
                `\\.${field}\\s*=\\s*([^,]+)`
            );


        const match = block.match(regex);

        return match
            ? match[1].trim()
            : null;

    }



    constant(block, field, index = null) {

        const regex =
            new RegExp(
                `\\.${field}\\s*=\\s*\\{([^}]+)\\}`
            );


        const match = block.match(regex);


        if (!match) {

            const single =
                this.raw(block, field);

            return single;

        }


        const values =
            match[1]
                .split(",")
                .map(v => v.trim());


        return values[index ?? 0];

    }



    type(block, index) {

        const regex =
            /\.types\s*=\s*\{([^}]+)\}/;

        const match =
            block.match(regex);


        if (!match) {
            return null;
        }


        return match[1]
            .split(",")
            [index]
            .trim();

    }

}


module.exports = SpeciesInfoParser;