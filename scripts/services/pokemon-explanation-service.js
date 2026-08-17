/**
 * Pokémon Companion
 * Pokémon Explanation Service
 *
 * Converts availability results into player-friendly explanations.
 *
 * Responsibilities:
 * - Explain why a Pokémon is available.
 * - Explain difficulty warnings.
 * - Explain restrictions.
 * - Generate UI-friendly messages.
 *
 * Does NOT:
 * - Calculate availability.
 * - Check encounters.
 * - Check progression.
 * - Recommend teams.
 */

"use strict";





class PokemonExplanationService {



    //--------------------------------
    // Explain availability result
    //--------------------------------


    explain(
        species,
        availabilityResult
    )
    {


        if(
            !availabilityResult
        )
        {

            return {

                pokemon:species,

                status:"UNKNOWN",

                summary:
                    "No availability information found."

            };

        }








        //--------------------------------
        // Locked Pokemon
        //--------------------------------


        if(
            !availabilityResult.available
        )
        {

            return {

                pokemon:species,

                status:"LOCKED",

                summary:
                    "This Pokémon is not available during the current progression.",

                reason:

                    availabilityResult.reason || null,


                missingRequirements:

                    availabilityResult.missingRequirements || []

            };


        }








        //--------------------------------
        // Available Pokemon
        //--------------------------------


        return {

            pokemon:species,

            status:"AVAILABLE",

            difficulty:

                availabilityResult.difficulty || "NORMAL",


            summary:

                this.generateSummary(

                    availabilityResult

                ),


            warning:

                availabilityResult.warning || null,


            source:

                availabilityResult.source || "NORMAL"

        };


    }









    //--------------------------------
    // Generate summary text
    //--------------------------------


    generateSummary(
        result
    )
    {


        switch(
            result.difficulty
        )
        {


            case "NORMAL":

                return "Available normally at this point in the adventure.";



            case "HARD_GRIND":

                return "Technically obtainable, but requires additional grinding compared to normal progression.";



            case "EXTREME_GRIND":

                return "Technically obtainable, but far outside normal progression and requires extreme grinding.";



            case "TRADE":

                return "Available through trading, but not through normal FireRed progression.";



            default:

                return "Availability confirmed.";

        }


    }









    //--------------------------------
    // Generate detailed explanation
    //--------------------------------


    generateDetails(
        availabilityResult
    )
    {


        const details = {};



        if(
            availabilityResult.source === "TRADE"
        )
        {

            details.method =
                "TRADE";

        }



        else
        {

            details.method =
                "NORMAL_PROGRESS";

        }



        if(
            availabilityResult.warning
        )
        {

            details.warning =
                availabilityResult.warning;

        }



        return details;


    }









    //--------------------------------
    // Check warning
    //--------------------------------


    hasWarning(
        explanation
    )
    {


        return Boolean(

            explanation.warning

        );


    }



}





module.exports =
    PokemonExplanationService;