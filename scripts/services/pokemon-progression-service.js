/**
 * Pokémon Companion
 * Pokémon Progression Service
 *
 * Coordinates Pokémon growth progression.
 *
 * Responsibilities:
 * - Give EXP.
 * - Process level ups.
 * - Process friendship gains from level ups.
 * - Process evolution.
 * - Return progression summary.
 *
 * Does NOT:
 * - Execute battles.
 * - Calculate damage.
 * - Handle moves.
 * - Manage trainers.
 * - Manage gyms.
 * - Load ROM data.
 */

"use strict";





class PokemonProgressionService {



    constructor(
        experienceService,
        levelUpService,
        evolutionService,
        friendshipService = null
    )
    {


        this.experience =
            experienceService;


        this.levelUp =
            levelUpService;


        this.evolution =
            evolutionService;


        this.friendship =
            friendshipService;


    }









    //--------------------------------
    // Process EXP reward
    //--------------------------------


    processExperience(
        pokemon,
        amount
    )
    {


        const expResult =
            this.experience.giveExp(

                pokemon,

                amount

            );





        if(
            !expResult.success
        )
        {

            return expResult;

        }








        let levelResult =
            null;


        let friendshipResults =
            [];








        if(
            expResult.levels.length > 0
        )
        {


            //--------------------------------
            // Apply actual level increases
            //--------------------------------


            levelResult =
                this.levelUp.levelUp(

                    pokemon,

                    expResult.levels.length

                );





            //--------------------------------
            // Apply friendship once for
            // every level gained.
            //--------------------------------


            if(
                this.friendship
                &&
                typeof this.friendship.applyLevelUp ===
                    "function"
            )
            {

                for(
                    const level of
                        expResult.levels
                )
                {

                    const friendshipResult =
                        this.friendship.applyLevelUp(

                            pokemon

                        );


                    friendshipResults.push(

                        {

                            level,

                            ...friendshipResult

                        }

                    );

                }

            }

        }








        return {


            success:true,


            experience:

                expResult,


            levelUp:

                levelResult,


            friendship:

                friendshipResults

        };


    }









    //--------------------------------
    // Process automatic evolution
    //--------------------------------


    processEvolution(
        pokemon,
        context = {}
    )
    {


        return this.evolution.checkEvolution(

            pokemon,

            context

        );


    }









    //--------------------------------
    // Full progression
    //--------------------------------


    processProgression(
        pokemon,
        amount,
        context = {}
    )
    {


        const progression =
            this.processExperience(

                pokemon,

                amount

            );





        if(
            !progression.success
        )
        {

            return progression;

        }








        let evolution =
            null;








        //--------------------------------
        // Evolution can only be checked
        // after an actual level-up.
        //--------------------------------

        if(
            progression.levelUp
            &&
            Array.isArray(
                progression.levelUp.levels
            )
            &&
            progression.levelUp.levels.length > 0
        )
        {


            const evolutionContext =
            {

                ...context,


                levelUp:
                    true,


                trigger:
                    "LEVEL_UP",


                evolutionTrigger:
                    "LEVEL_UP"

            };


            const evolutionResult =
                this.processEvolution(

                    pokemon,

                    evolutionContext

                );



            if(
                evolutionResult.success
            )
            {

                evolution =
                    evolutionResult;

            }

        }








        return {


            success:true,


            pokemon:

                pokemon.species,


            experience:

                progression.experience,


            levelUp:

                progression.levelUp,


            friendship:

                progression.friendship,


            evolution

        };


    }









    //--------------------------------
    // Summary
    //--------------------------------


    getSummary(
        pokemon
    )
    {


        return {

            species:
                pokemon.species,


            level:
                pokemon.level,


            exp:
                pokemon.exp,


            friendship:
                pokemon.friendship !== undefined

                ?

                pokemon.friendship

                :

                null,


            progress:
                this.experience.getExpProgress(
                    pokemon
                ),


            evolution:
                pokemon.evolutionHistory || []

        };


    }



}





module.exports =
    PokemonProgressionService;