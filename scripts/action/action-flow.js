/**
 * Pokémon Companion
 * Action Flow
 *
 * Processes player reported actions.
 *
 * Responsibilities:
 * - Validate actions.
 * - Record actions.
 * - Provide action results.
 *
 * Does NOT:
 * - Execute battles.
 * - Automatically change game state.
 */

"use strict";



class ActionFlow {



    constructor(
        actionManager
    )
    {

        this.actions =
            actionManager;

    }









    //--------------------------------
    // Submit action
    //--------------------------------


    submit(
        action
    )
    {


        if(
            !action ||
            !action.type
        )
        {

            return {

                success:false,

                reason:
                    "Invalid action"

            };

        }








        return this.actions
            .addAction(
                action
            );


    }









    //--------------------------------
    // Capture action
    //--------------------------------


    capturePokemon(
        species,
        level,
        location
    )
    {


        return this.submit({

            type:
                "CAPTURE_POKEMON",


            reference:
                species,


            species,


            level,


            location


        });


    }









    //--------------------------------
    // Trainer defeat
    //--------------------------------


    defeatTrainer(
        trainer
    )
    {


        return this.submit({

            type:
                "DEFEATED_TRAINER",


            reference:
                trainer,


            trainer


        });


    }









    //--------------------------------
    // Gym badge
    //--------------------------------


    earnBadge(
        gym,
        badge
    )
    {


        return this.submit({

            type:
                "EARNED_BADGE",


            reference:
                gym,


            gym,


            badge


        });


    }









    //--------------------------------
    // History
    //--------------------------------


    getHistory()
    {

        return this.actions
            .getAll();

    }



}





module.exports =
    ActionFlow;