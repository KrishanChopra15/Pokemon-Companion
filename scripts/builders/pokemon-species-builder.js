/**
 * Pokémon Companion
 * Pokémon Species Builder
 *
 * Builds the generated Pokémon species database by combining
 * raw extraction data with reference databases.
 *
 * Responsibilities:
 * - Read the raw Pokémon species database.
 * - Read reference databases.
 * - Merge datasets.
 * - Write the generated Pokémon species database.
 *
 * Does NOT:
 * - Read ROMs.
 * - Parse binary data.
 * * - Generate reference databases.
 */

"use strict";

const Builder = require("./builder");
const ReferenceRegistry = require("./reference-registry");
const EvolutionMoveBuilder = require("./evolution-move-builder");

class PokemonSpeciesBuilder extends Builder {

    /**
     * Build the generated Pokémon species database.
     *
     * @param {string} game
     */
    build(game) {

        //------------------------------------------------------
        // Load databases
        //------------------------------------------------------

        const rawSpecies = this.loadRawDatabase(
            game,
            "pokemon-species"
        );

        const rawEvolutions = this.loadRawDatabase(
            game,
            "pokemon-evolutions"
        );

        const rawLearnsets = this.loadRawDatabase(
            game,
            "pokemon-learnsets"
        );

        const rawMachines = this.loadRawDatabase(
            game,
            "pokemon-machines"
        );

        const rawEggMoves = this.loadRawDatabase(
            game,
            "pokemon-egg-moves"
        );

        const references = new ReferenceRegistry();

        const evolutionMoveBuilder = new EvolutionMoveBuilder();

        const evolutionsBySpecies = new Map();

        const learnsetsBySpecies = new Map();

        const machinesBySpecies = new Map();

        const eggMovesBySpecies = new Map();

        for (const evolution of rawEvolutions) {
        
            evolutionsBySpecies.set(
                evolution.species,
                evolution
            );
        
        }

        for (const learnset of rawLearnsets) {
        
            learnsetsBySpecies.set(
                learnset.species,
                learnset
            );
        
        }

        for (const machine of rawMachines) {
        
            machinesBySpecies.set(
                machine.species,
                machine
            );
        
        }

        for (const eggMove of rawEggMoves) {
        
            eggMovesBySpecies.set(
                eggMove.species,
                eggMove
            );
        
        }

        //------------------------------------------------------
        // Merge
        //------------------------------------------------------

        const generatedSpecies = rawSpecies.map((species, index) => {

            const reference = references.speciesNames.get(index + 1);

            const evolutionData = evolutionsBySpecies.get(
                reference.constant
            );

            const learnsetData = learnsetsBySpecies.get(
                reference.constant
            );

            const machineData = machinesBySpecies.get(
                reference.constant
            );

            const eggMoveData = eggMovesBySpecies.get(
                reference.constant
            );

            const type1 = references.types.get(species.type1);
            const type2 = references.types.get(species.type2);
                    
            const ability1 = references.abilities.get(species.ability1);
            const ability2 = references.abilities.get(species.ability2);
                    
            const growthRate = references.growthRates.get(species.growthRate);
                    
            const eggGroup1 = references.eggGroups.get(species.eggGroup1);
            const eggGroup2 = references.eggGroups.get(species.eggGroup2);

            const bodyColor = references.bodyColors.get(species.bodyColor);

            return {

                ...species,
                
                itemCommon: this.buildHeldItem(
                    species.itemCommon,
                    references
                ),

                itemRare: this.buildHeldItem(
                    species.itemRare,
                    references
                ),

                id: String(index + 1).padStart(4, "0"),

                nationalDexNumber: String(index + 1).padStart(4, "0"),

                name: reference
                    ? reference.name
                    : null,

                constant: reference
                    ? reference.constant
                    : null,

                type1: this.buildType(type1),

                type2: this.buildType(type2),

                ability1: this.buildAbility(ability1),

                ability2: this.buildAbility(ability2),

                growthRate: this.buildGrowthRate(growthRate),

                eggGroup1: this.buildEggGroup(eggGroup1),

                eggGroup2: this.buildEggGroup(eggGroup2),

                bodyColor: this.buildBodyColor(bodyColor),
                
                evolutions: evolutionData
                    ? evolutionData.evolutions.map(evolution =>
                        this.buildEvolution(
                            evolution,
                            references
                        )
                    )
                    : [],

                learnset: learnsetData
                    ? learnsetData.moves.map(move => ({

                        level: move.level,
                    
                        move: references.moveNames.getByConstant(
                            move.move
                        )
                    
                    }))
                    : [],

                machines: machineData
                    ? machineData.machines.map(machine => {
                    
                        const reference =
                        references.machines.getByConstant(
                            machine
                        );
                    
                        if (!reference) {
                            return null;
                        }
                    
                        return {
                        
                            constant:
                            reference.constant,
                        
                            name:
                            reference.name,
                        
                            itemConstant:
                            reference.itemConstant,
                        
                            move:
                            references.moveNames.getByConstant(
                                reference.move.constant
                            )
                        
                        };
                    
                    }).filter(Boolean)
                    : [],

                eggMoves: eggMoveData
                    ? eggMoveData.moves.map(move =>
                        references.moveNames.getByConstant(
                            move
                        )
                    )
                    : [],

                evolutionLostMoves: []

            };

        });

        //------------------------------------------------------
        // Species lookup
        //------------------------------------------------------

        const speciesByConstant = new Map();

        for (const species of generatedSpecies) {
        
            speciesByConstant.set(
                species.constant,
                species
            );
        
        }

        //------------------------------------------------------
        // Resolve evolution species
        //------------------------------------------------------
            
        for (const species of generatedSpecies) {
        
            for (const evolution of species.evolutions) {
            
                const target = speciesByConstant.get(
                    evolution.targetSpecies
                );
            
                if (!target) {
                
                    continue;
                
                }
            
                evolution.targetSpecies = {
                
                    id: target.id,
                
                    nationalDexNumber: target.nationalDexNumber,
                
                    name: target.name
                
                };
            
            }
        
        }

        //------------------------------------------------------
        // Build evolution exclusive moves
        //------------------------------------------------------

        for (const species of generatedSpecies) {
        
        
            species.evolutionLostMoves =
            evolutionMoveBuilder.build(
                species,
                generatedSpecies
            );
        
        
        }

        //------------------------------------------------------
        // Save
        //------------------------------------------------------

        this.saveGeneratedDatabase(
            game,
            "pokemon-species",
            generatedSpecies
        );

        console.log();

        console.log(
            "Generated Pokémon species database."
        );

        console.log(
            `Species: ${generatedSpecies.length}`
        );

        console.log();

    }

    /**
     * Resolve an evolution parameter.
     *
     * @param {string} parameter
     * @returns {number|string}
     */
    resolveEvolutionParameter(parameter, references) {

        // Numeric parameter
        if (/^\d+$/.test(parameter)) {

            return Number(parameter);

        }

        // Item
        if (parameter.startsWith("ITEM_")) {

            const item = references.items.getByConstant(parameter);

            if (item) {

                return item;

            }

        }

        return parameter;

    }

    /**
     * Build an evolution object.
     *
     * @param {Object} evolution
     * @param {ReferenceRegistry} references
     * @returns {Object}
     */
    buildEvolution(evolution, references) {

        const method = references.evolutionMethods.getByConstant(
            evolution.method
        );

        const result = {

            method,

            targetSpecies: evolution.targetSpecies

        };
        
        switch (method.constant) {
        
            //--------------------------------------------------
            // Level evolutions
            //--------------------------------------------------
        
            case "EVO_LEVEL":
            case "EVO_LEVEL_ATK_GT_DEF":
            case "EVO_LEVEL_ATK_EQ_DEF":
            case "EVO_LEVEL_ATK_LT_DEF":
            case "EVO_LEVEL_SILCOON":
            case "EVO_LEVEL_CASCOON":
            case "EVO_LEVEL_NINJASK":
            case "EVO_LEVEL_SHEDINJA":
        
                result.level = Number(
                    evolution.parameter
                );
            
                break;
            
            //--------------------------------------------------
            // Item evolutions
            //--------------------------------------------------
            
            case "EVO_ITEM":
            case "EVO_TRADE_ITEM":
            
                result.item = references.items.getByConstant(
                    evolution.parameter
                );
            
                break;
            
            //--------------------------------------------------
            // Beauty evolution
            //--------------------------------------------------
            
            case "EVO_BEAUTY":
            
                result.beauty = Number(
                    evolution.parameter
                );
            
                break;
            
        }

        return result;

    }

    /**
     * Resolve a held item.
     *
     * @param {number} id
     * @param {ReferenceRegistry} references
     * @returns {Object|null}
     */
    buildHeldItem(id, references) {

        if (id === 0) {

            return null;

        }

        return references.items.get(id);

    }

    /**
     * Build a type object.
     *
     * @param {Object|null} type
     * @returns {Object|null}
     */
    buildType(type) {

        if (!type) {

            return null;

        }

        return {

            id: type.id,

            name: type.name

        };

    }

    /**
     * Build an ability object.
     *
     * @param {Object|null} ability
     * @returns {Object|null}
     */
    buildAbility(ability) {

        if (!ability) {

            return null;

        }

        return {

            id: ability.id,

            name: ability.name,

            description: ability.description

        };

    }

    /**
     * Build a growth rate object.
     *
     * @param {Object|null} growthRate
     * @returns {Object|null}
     */
    buildGrowthRate(growthRate) {

        if (!growthRate) {

            return null;

        }

        return {

            id: growthRate.id,

            name: growthRate.name

        };

    }

    /**
     * Build an egg group object.
     *
     * @param {Object|null} eggGroup
     * @returns {Object|null}
     */
    buildEggGroup(eggGroup) {

        if (!eggGroup) {

            return null;

        }

        return {

            id: eggGroup.id,

            name: eggGroup.name

        };

    }

    /**
     * Build a body color object.
     *
     * @param {Object|null} bodyColor
     * @returns {Object|null}
     */
    buildBodyColor(bodyColor) {

        if (!bodyColor) {

            return null;

        }

        return {

            id: bodyColor.id,

            name: bodyColor.name

        };

    }

}

module.exports = PokemonSpeciesBuilder;