/**
 * Pokémon Companion
 * Pokémon Progression Service
 *
 * Coordinates Pokémon growth progression.
 *
 * Responsibilities:
 * - Give EXP.
 * - Process level ups.
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
        evolutionService
    )
    {


        this.experience =
            experienceService;


        this.levelUp =
            levelUpService;


        this.evolution =
            evolutionService;


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








        if(
            expResult.levels.length > 0
        )
        {


            levelResult =
                this.levelUp.levelUp(

                    pokemon,

                    expResult.levels.length

                );


        }








        return {


            success:true,


            experience:

                expResult,


            levelUp:

                levelResult


        };


    }









    //--------------------------------
    // Process automatic evolution
    //--------------------------------


    processEvolution(
        pokemon
    )
    {


        return this.evolution.checkEvolution(

            pokemon

        );


    }









    //--------------------------------
    // Full progression
    //--------------------------------


    processProgression(
        pokemon,
        amount
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








        if(
            progression.levelUp
        )
        {

            const evolutionResult =
                this.processEvolution(

                    pokemon

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