/**
 * Pokémon Companion
 * Evolution Requirement Service
 *
 * Resolves evolution requirements.
 *
 * Responsibilities:
 * - Find evolution sources.
 * - Check evolution requirements.
 * - Validate evolution availability by progression.
 * - Explain evolution restrictions.
 *
 * Does NOT:
 * - Load databases.
 * - Handle battles.
 * - Handle Pokémon availability.
 */

"use strict";





class EvolutionRequirementService {



    constructor(
        evolutionDatabase = []
    )
    {


        this.evolutions =
            evolutionDatabase;


    }









    //--------------------------------
    // Find evolution source
    //--------------------------------


    getEvolutionSource(
        species
    )
    {


        for(
            const chain of this.evolutions
        )
        {


            if(
                !chain.evolutions
            )
            {

                continue;

            }



            for(
                const evolution of chain.evolutions
            )
            {


                if(
                    evolution.target === species
                )
                {


                    return {


                        from:

                            chain.species,


                        requirement:

                        {

                            method:
                                evolution.method,


                            level:
                                evolution.level || null,


                            item:
                                evolution.item || null


                        }


                    };

                }


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


                available:false,


                reason:
                    "No evolution source found"


            };

        }








        const requirement =
            evolution.requirement;








        //--------------------------------
        // Level evolution
        //--------------------------------


        if(
            requirement.method === "LEVEL"
        )
        {


            if(
                !stageRule
                ||
                !stageRule.maxReasonableLevel
            )
            {

                return {


                    available:false,


                    reason:
                    "Missing stage level rule"


                };

            }








            if(
                requirement.level
                <=
                stageRule.maxReasonableLevel
            )
            {

                return {


                    available:true

                };

            }








            return {


                available:false,


                reason:

                    `Requires level ${requirement.level}`


            };


        }









        //--------------------------------
        // Item evolution
        //--------------------------------


        if(
            requirement.method === "EVO_ITEM"
        )
        {


            return {


                available:false,


                reason:

                    `Requires item: ${requirement.item}`


            };


        }









        //--------------------------------
        // Trade evolution
        //--------------------------------


        if(
            requirement.method === "EVO_TRADE"
        )
        {


            return {


                available:false,


                reason:
                    "Requires trade evolution"


            };


        }









        return {


            available:false,


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


                evolves:false


            };

        }








        return {


            species,


            evolves:true,


            from:

                evolution.from,


            requirement:

                evolution.requirement


        };


    }



}





module.exports =
    EvolutionRequirementService;