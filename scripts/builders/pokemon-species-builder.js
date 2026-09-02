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
 * - Generate reference databases.
 */

"use strict";


const Builder =
    require("./builder");


const ReferenceRegistry =
    require("./reference-registry");


const EvolutionMoveBuilder =
    require("./evolution-move-builder");



class PokemonSpeciesBuilder
    extends Builder
{


    /**
     * Build the generated Pokémon species database.
     *
     * @param {string} game
     */
    build(
        game
    )
    {

        //------------------------------------------------------
        // Load databases
        //------------------------------------------------------

        const rawSpecies =
            this.loadRawDatabase(
                game,
                "pokemon-species"
            );


        const rawEvolutions =
            this.loadRawDatabase(
                game,
                "pokemon-evolutions"
            );


        const rawLearnsets =
            this.loadRawDatabase(
                game,
                "pokemon-learnsets"
            );


        const rawMachines =
            this.loadRawDatabase(
                game,
                "pokemon-machines"
            );


        const rawEggMoves =
            this.loadRawDatabase(
                game,
                "pokemon-egg-moves"
            );


        const references =
            new ReferenceRegistry();


        const evolutionMoveBuilder =
            new EvolutionMoveBuilder();


        const evolutionsBySpecies =
            new Map();


        const learnsetsBySpecies =
            new Map();


        const machinesBySpecies =
            new Map();


        const eggMovesBySpecies =
            new Map();


        for(
            const evolution of rawEvolutions
        )
        {

            evolutionsBySpecies.set(
                evolution.species,
                evolution
            );

        }


        for(
            const learnset of rawLearnsets
        )
        {

            learnsetsBySpecies.set(
                learnset.species,
                learnset
            );

        }


        for(
            const machine of rawMachines
        )
        {

            machinesBySpecies.set(
                machine.species,
                machine
            );

        }


        for(
            const eggMove of rawEggMoves
        )
        {

            eggMovesBySpecies.set(
                eggMove.species,
                eggMove
            );

        }


        //------------------------------------------------------
        // Merge
        //------------------------------------------------------

        const generatedSpecies =
            rawSpecies

                //----------------------------------------------
                // SPECIES_NONE is an internal placeholder and
                // must not become a generated Pokémon record.
                //----------------------------------------------

                .filter(

                    species =>
                        species
                        &&
                        species.constant !==
                        "SPECIES_NONE"

                )

                .map(

                    (
                        species
                    ) =>
                    {

                        //------------------------------------------
                        // Resolve the reference by constant.
                        //
                        // Do NOT use array index because raw
                        // extraction includes SPECIES_NONE.
                        //------------------------------------------

                        const reference =
                            references.speciesNames.getByConstant(
                                species.constant
                            );


                        const evolutionData =
                            reference
                            ?
                            evolutionsBySpecies.get(
                                reference.constant
                            )
                            :
                            null;


                        const learnsetData =
                            reference
                            ?
                            learnsetsBySpecies.get(
                                reference.constant
                            )
                            :
                            null;


                        const machineData =
                            reference
                            ?
                            machinesBySpecies.get(
                                reference.constant
                            )
                            :
                            null;


                        const eggMoveData =
                            reference
                            ?
                            eggMovesBySpecies.get(
                                reference.constant
                            )
                            :
                            null;


                        const ability1 =
                            references.abilities.get(
                                species.ability1
                            );


                        const ability2 =
                            references.abilities.get(
                                species.ability2
                            );


                        const growthRate =
                            references.growthRates.get(
                                species.growthRate
                            );


                        const eggGroup1 =
                            references.eggGroups.get(
                                species.eggGroup1
                            );


                        const eggGroup2 =
                            references.eggGroups.get(
                                species.eggGroup2
                            );


                        const bodyColor =
                            references.bodyColors.get(
                                species.bodyColor
                            );


                        const type1 =
                            references.types.get(
                                species.type1
                            );


                        let type2 =
                            references.types.get(
                                species.type2
                            );


                        //------------------------------------------
                        // Pokédex reference
                        //------------------------------------------

                        const pokedex =
                            reference
                            ?
                            references.pokedex.getByConstant(
                                reference.constant
                            )
                            :
                            null;


                        //------------------------------------------
                        // Remove duplicate secondary type
                        //------------------------------------------

                        if(
                            type1
                            &&
                            type2
                            &&
                            type1.id ===
                            type2.id
                        )
                        {

                            type2 =
                                null;

                        }


                        //------------------------------------------
                        // Generated species record
                        //------------------------------------------

                        return {

                            ...species,


                            //----------------------------------
                            // Held items
                            //----------------------------------

                            itemCommon:
                                this.buildHeldItem(
                                    species.itemCommon,
                                    references
                                ),


                            itemRare:
                                this.buildHeldItem(
                                    species.itemRare,
                                    references
                                ),


                            //----------------------------------
                            // Identity
                            //----------------------------------

                            id:
                                reference
                                ?
                                String(
                                    reference.id
                                ).padStart(
                                    4,
                                    "0"
                                )
                                :
                                String(
                                    species.id
                                ).padStart(
                                    4,
                                    "0"
                                ),


                            nationalDexNumber:
                                reference
                                ?
                                String(
                                    reference.id
                                ).padStart(
                                    4,
                                    "0"
                                )
                                :
                                String(
                                    species.id
                                ).padStart(
                                    4,
                                    "0"
                                ),


                            name:
                                reference
                                ?
                                reference.name
                                :
                                species.constant

                                    .replace(
                                        /^SPECIES_/,
                                        ""
                                    ),


                            constant:
                                species.constant,


                            //----------------------------------
                            // Types
                            //----------------------------------

                            type1:
                                this.buildType(
                                    type1
                                ),


                            type2:
                                this.buildType(
                                    type2
                                ),


                            //----------------------------------
                            // Abilities
                            //----------------------------------

                            ability1:
                                this.buildAbility(
                                    ability1
                                ),


                            ability2:
                                this.buildAbility(
                                    ability2
                                ),


                            //----------------------------------
                            // Growth
                            //----------------------------------

                            growthRate:
                                this.buildGrowthRate(
                                    growthRate
                                ),


                            //----------------------------------
                            // Egg groups
                            //----------------------------------

                            eggGroup1:
                                this.buildEggGroup(
                                    eggGroup1
                                ),


                            eggGroup2:
                                this.buildEggGroup(
                                    eggGroup2
                                ),


                            //----------------------------------
                            // Body color
                            //----------------------------------

                            bodyColor:
                                this.buildBodyColor(
                                    bodyColor
                                ),


                            //----------------------------------
                            // Pokédex
                            //----------------------------------

                            pokedex:
                                this.buildPokedex(
                                    pokedex
                                ),


                            //----------------------------------
                            // Pickup
                            //----------------------------------

                            pickup:
                                this.hasPickupAbility(
                                    species
                                ),


                            //----------------------------------
                            // Evolutions
                            //----------------------------------

                            evolutions:
                                evolutionData
                                ?
                                evolutionData.evolutions.map(
                                    evolution =>
                                        this.buildEvolution(
                                            evolution,
                                            references
                                        )
                                )
                                :
                                [],


                            //----------------------------------
                            // Level-up moves
                            //----------------------------------

                            learnset:
                                learnsetData
                                ?
                                learnsetData.moves.map(
                                    move =>
                                    ({

                                        level:
                                            move.level,

                                        move:
                                            references.moveNames
                                                .getByConstant(
                                                    move.move
                                                )

                                    })
                                )
                                :
                                [],


                            //----------------------------------
                            // Machines
                            //----------------------------------

                            machines:
                                machineData
                                ?
                                machineData.machines
                                    .map(
                                        machine =>
                                        {

                                            const reference =
                                                references.machines
                                                    .getByConstant(
                                                        machine
                                                    );


                                            if(
                                                !reference
                                            )
                                            {

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
                                                    references.moveNames
                                                        .getByConstant(
                                                            reference.move.constant
                                                        )

                                            };

                                        }
                                    )
                                    .filter(
                                        Boolean
                                    )
                                :
                                [],


                            //----------------------------------
                            // Egg moves
                            //----------------------------------

                            eggMoves:
                                eggMoveData
                                ?
                                eggMoveData.moves.map(
                                    move =>
                                        references.moveNames
                                            .getByConstant(
                                                move
                                            )
                                )
                                :
                                [],


                            //----------------------------------
                            // Evolution-exclusive moves
                            //----------------------------------

                            evolutionLostMoves:
                                []

                        };

                    }

                );


        //------------------------------------------------------
        // Species lookup
        //------------------------------------------------------

        const speciesByConstant =
            new Map();


        for(
            const species of generatedSpecies
        )
        {

            speciesByConstant.set(
                species.constant,
                species
            );

        }


        //------------------------------------------------------
        // Resolve evolution species
        //------------------------------------------------------

        for(
            const species of generatedSpecies
        )
        {

            for(
                const evolution of species.evolutions
            )
            {

                const target =
                    speciesByConstant.get(
                        evolution.targetSpecies
                    );


                if(
                    !target
                )
                {

                    continue;

                }


                evolution.targetSpecies =
                {

                    id:
                        target.id,

                    nationalDexNumber:
                        target.nationalDexNumber,

                    name:
                        target.name

                };

            }

        }


        //------------------------------------------------------
        // Build evolution exclusive moves
        //------------------------------------------------------

        for(
            const species of generatedSpecies
        )
        {

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
     * @param {ReferenceRegistry} references
     * @returns {number|string|Object}
     */
    resolveEvolutionParameter(
        parameter,
        references
    )
    {

        //--------------------------------
        // Numeric parameter
        //--------------------------------

        if(
            /^\d+$/.test(
                parameter
            )
        )
        {

            return Number(
                parameter
            );

        }


        //--------------------------------
        // Item
        //--------------------------------

        if(
            parameter.startsWith(
                "ITEM_"
            )
        )
        {

            const item =
                references.items.getByConstant(
                    parameter
                );


            if(
                item
            )
            {

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
    buildEvolution(
        evolution,
        references
    )
    {

        const method =
            references.evolutionMethods.getByConstant(
                evolution.method
            );


        const result =
        {

            method,

            targetSpecies:
                evolution.targetSpecies

        };


        switch(
            method.constant
        )
        {

            //----------------------------------------------
            // Level evolutions
            //----------------------------------------------

            case "EVO_LEVEL":

            case "EVO_LEVEL_ATK_GT_DEF":

            case "EVO_LEVEL_ATK_EQ_DEF":

            case "EVO_LEVEL_ATK_LT_DEF":

            case "EVO_LEVEL_SILCOON":

            case "EVO_LEVEL_CASCOON":

            case "EVO_LEVEL_NINJASK":

            case "EVO_LEVEL_SHEDINJA":

                result.level =
                    Number(
                        evolution.parameter
                    );

                break;


            //----------------------------------------------
            // Item evolutions
            //----------------------------------------------

            case "EVO_ITEM":

            case "EVO_TRADE_ITEM":

                result.item =
                    references.items.getByConstant(
                        evolution.parameter
                    );

                break;


            //----------------------------------------------
            // Beauty evolution
            //----------------------------------------------

            case "EVO_BEAUTY":

                result.beauty =
                    Number(
                        evolution.parameter
                    );

                break;

        }


        return result;

    }


    /**
     * Build a held item.
     *
     * @param {Object|number|string|null} item
     * @param {ReferenceRegistry} references
     * @returns {Object|null}
     */
    buildHeldItem(
        item,
        references
    )
    {

        //--------------------------------
        // No item
        //--------------------------------

        if(
            item === null
            ||
            item === undefined
            ||
            item === 0
        )
        {

            return null;

        }


        //--------------------------------
        // ITEM_NONE constant
        //--------------------------------

        if(
            typeof item === "string"
            &&
            item === "ITEM_NONE"
        )
        {

            return null;

        }


        //--------------------------------
        // ITEM_NONE object
        //--------------------------------

        if(
            typeof item === "object"
            &&
            (
                item.id === 0
                ||
                item.constant ===
                    "ITEM_NONE"
            )
        )
        {

            return null;

        }


        //--------------------------------
        // Item object
        //--------------------------------

        if(
            typeof item === "object"
            &&
            item.id !== undefined
        )
        {

            return references.items.get(
                item.id
            );

        }


        //--------------------------------
        // Item reference
        //--------------------------------

        return references.items.get(
            item
        );

    }


    //----------------------------------------
    // Check Pickup ability
    //----------------------------------------

    /**
     * Check whether a Pokémon has Pickup.
     *
     * @param {Object} species
     * @returns {boolean}
     */
    hasPickupAbility(
        species
    )
    {

        return (
            species.ability1 ===
            "ABILITY_PICKUP"
        )
        ||
        (
            species.ability2 ===
            "ABILITY_PICKUP"
        );

    }


    /**
     * Build a type object.
     *
     * @param {Object|null} type
     * @returns {Object|null}
     */
    buildType(
        type
    )
    {

        if(
            !type
        )
        {

            return null;

        }


        return {

            id:
                type.id,

            name:
                type.name

        };

    }


    /**
     * Build a Pokédex object.
     *
     * @param {Object|null} pokedex
     * @returns {Object|null}
     */
    buildPokedex(
        pokedex
    )
    {

        if(
            !pokedex
        )
        {

            return null;

        }


        return {

            game:
                pokedex.game,

            generation:
                pokedex.generation,

            category:
                pokedex.category,

            height:
                pokedex.height,

            weight:
                pokedex.weight,

            description:
                pokedex.description

        };

    }


    /**
     * Build an ability object.
     *
     * @param {Object|null} ability
     * @returns {Object|null}
     */
    buildAbility(
        ability
    )
    {

        if(
            !ability
            ||
            ability.id === 0
            ||
            ability.name ===
                "-------"
        )
        {

            return null;

        }


        return {

            id:
                ability.id,

            name:
                ability.name,

            description:
                ability.description

        };

    }


    /**
     * Build a growth rate object.
     *
     * @param {Object|null} growthRate
     * @returns {Object|null}
     */
    buildGrowthRate(
        growthRate
    )
    {

        if(
            !growthRate
        )
        {

            return null;

        }


        return {

            id:
                growthRate.id,

            name:
                growthRate.name

        };

    }


    /**
     * Build an egg group object.
     *
     * @param {Object|null} eggGroup
     * @returns {Object|null}
     */
    buildEggGroup(
        eggGroup
    )
    {

        if(
            !eggGroup
        )
        {

            return null;

        }


        return {

            id:
                eggGroup.id,

            name:
                eggGroup.name

        };

    }


    /**
     * Build a body color object.
     *
     * @param {Object|null} bodyColor
     * @returns {Object|null}
     */
    buildBodyColor(
        bodyColor
    )
    {

        if(
            !bodyColor
        )
        {

            return null;

        }


        return {

            id:
                bodyColor.id,

            name:
                bodyColor.name

        };

    }


}


module.exports =
    PokemonSpeciesBuilder;