/**
 * Pokémon Companion
 * Evolution Requirement Service
 *
 * Resolves evolution requirements.
 *
 * Responsibilities:
 * - Find evolution sources.
 * - Check evolution requirements.
 * - Validate evolution requirements by progression.
 * - Explain evolution restrictions.
 *
 * Does NOT:
 * - Load databases.
 * - Handle battles.
 * - Handle Pokémon availability.
 */

"use strict";





class EvolutionRequirementService
{


    constructor(
        evolutionDatabase = []
    )
    {

        this.evolutions =
            Array.isArray(
                evolutionDatabase
            )
            ?
            evolutionDatabase
            :
            [];

    }





    //--------------------------------
    // Normalize evolution method
    //--------------------------------

    normalizeMethod(
        method
    )
    {

        if(
            method ===
            null
            ||
            method ===
            undefined
        )
        {

            return null;

        }


        const value =
            String(
                method
            )
            .trim()
            .toUpperCase();


        //--------------------------------
        // Raw FireRed methods
        //--------------------------------

        switch(
            value
        )
        {

            case "EVO_LEVEL":

                return "LEVEL";


            case "EVO_ITEM":

                return "EVO_ITEM";


            case "EVO_TRADE":

                return "EVO_TRADE";


            case "EVO_TRADE_ITEM":

                return "EVO_TRADE_ITEM";


            case "EVO_BEAUTY":

                return "BEAUTY";


            case "EVO_LEVEL_ATK_GT_DEF":

            case "EVO_LEVEL_ATK_EQ_DEF":

            case "EVO_LEVEL_ATK_LT_DEF":

            case "EVO_LEVEL_SILCOON":

            case "EVO_LEVEL_CASCOON":

            case "EVO_LEVEL_NINJASK":

            case "EVO_LEVEL_SHEDINJA":

                return "LEVEL";


        }


        //--------------------------------
        // Already-normalized methods
        //--------------------------------

        return value;

    }





    //--------------------------------
    // Build requirement object
    //--------------------------------

    buildRequirement(
        evolution
    )
    {

        if(
            !evolution
        )
        {

            return null;

        }


        const method =
            this.normalizeMethod(
                evolution.method
            );


        const parameter =
            evolution.parameter;


        //--------------------------------
        // Level
        //--------------------------------

        if(
            method ===
            "LEVEL"
        )
        {

            const level =
                evolution.level
                ??
                parameter;


            return {

                method,

                level:
                    level !==
                    undefined
                    &&
                    level !==
                    null
                    &&
                    level !==
                    ""
                    ?
                    Number(
                        level
                    )
                    :
                    null,

                item:
                    null

            };

        }


        //--------------------------------
        // Item
        //--------------------------------

        if(
            method ===
            "EVO_ITEM"
        )
        {

            return {

                method,

                level:
                    null,

                item:
                    evolution.item
                    ??
                    parameter
                    ??
                    null

            };

        }


        //--------------------------------
        // Trade
        //--------------------------------

        if(
            method ===
            "EVO_TRADE"
        )
        {

            return {

                method,

                level:
                    null,

                item:
                    null

            };

        }


        //--------------------------------
        // Trade + item
        //--------------------------------

        if(
            method ===
            "EVO_TRADE_ITEM"
        )
        {

            return {

                method,

                level:
                    null,

                item:
                    evolution.item
                    ??
                    parameter
                    ??
                    null

            };

        }


        //--------------------------------
        // Beauty
        //--------------------------------

        if(
            method ===
            "BEAUTY"
        )
        {

            return {

                method,

                level:
                    null,

                item:
                    null,

                beauty:
                    evolution.beauty
                    ??
                    parameter
                    ??
                    null

            };

        }


        //--------------------------------
        // Unknown method
        //--------------------------------

        return {

            method,

            level:
                evolution.level
                ??
                null,

            item:
                evolution.item
                ??
                null

        };

    }





    //--------------------------------
    // Find evolution source
    //--------------------------------

    getEvolutionSource(
        species
    )
    {

        if(
            !species
        )
        {

            return null;

        }


        for(
            const chain of
                this.evolutions
        )
        {

            if(
                !chain
                ||
                !Array.isArray(
                    chain.evolutions
                )
            )
            {

                continue;

            }


            for(
                const evolution of
                    chain.evolutions
            )
            {

                if(
                    !evolution
                )
                {

                    continue;

                }


                //--------------------------------
                // Raw FireRed uses targetSpecies.
                //
                // Older normalized data may use
                // target.
                //--------------------------------

                const target =
                    evolution.targetSpecies
                    ??
                    evolution.target;


                if(
                    target !==
                    species
                )
                {

                    continue;

                }


                return {

                    from:

                        chain.species,

                    requirement:

                        this.buildRequirement(
                            evolution
                        )

                };

            }

        }


        return null;

    }





    //--------------------------------
    // Check evolution possible
    //--------------------------------

    canEvolveBeforeStage(
        species,
        stageRule
    )
    {

        const evolution =
            this.getEvolutionSource(
                species
            );


        if(
            !evolution
        )
        {

            return {

                available:
                    false,

                reason:
                    "No evolution source found"

            };

        }


        const requirement =
            evolution.requirement;


        if(
            !requirement
        )
        {

            return {

                available:
                    false,

                reason:
                    "Missing evolution requirement"

            };

        }


        //--------------------------------
        // Level evolution
        //--------------------------------

        if(
            requirement.method ===
            "LEVEL"
        )
        {

            if(
                !stageRule
                ||
                !stageRule.maxReasonableLevel
            )
            {

                return {

                    available:
                        false,

                    reason:
                        "Missing stage level rule"

                };

            }


            if(
                requirement.level !==
                    null
                &&
                requirement.level <=
                    stageRule.maxReasonableLevel
            )
            {

                return {

                    available:
                        true

                };

            }


            return {

                available:
                    false,

                reason:

                    `Requires level ${requirement.level}`

            };

        }


        //--------------------------------
        // Item evolution
        //--------------------------------

        if(
            requirement.method ===
            "EVO_ITEM"
        )
        {

            return {

                available:
                    false,

                reason:

                    `Requires item: ${requirement.item}`

            };

        }


        //--------------------------------
        // Trade evolution
        //--------------------------------

        if(
            requirement.method ===
            "EVO_TRADE"
        )
        {

            return {

                available:
                    true,

                reason:
                    null

            };

        }


        //--------------------------------
        // Trade + item
        //--------------------------------

        if(
            requirement.method ===
            "EVO_TRADE_ITEM"
        )
        {

            return {

                available:
                    false,

                reason:

                    `Requires trade and item: ${requirement.item}`

            };

        }


        //--------------------------------
        // Beauty evolution
        //--------------------------------

        if(
            requirement.method ===
            "BEAUTY"
        )
        {

            return {

                available:
                    false,

                reason:

                    `Requires beauty: ${requirement.beauty}`

            };

        }


        //--------------------------------
        // Unknown
        //--------------------------------

        return {

            available:
                false,

            reason:
                "Unknown evolution requirement"

        };

    }





    //--------------------------------
    // Explain requirement
    //--------------------------------

    explain(
        species
    )
    {

        const evolution =
            this.getEvolutionSource(
                species
            );


        if(
            !evolution
        )
        {

            return {

                species,

                evolves:
                    false

            };

        }


        return {

            species,

            evolves:
                true,

            from:
                evolution.from,

            requirement:
                evolution.requirement

        };

    }


}





module.exports =
    EvolutionRequirementService;