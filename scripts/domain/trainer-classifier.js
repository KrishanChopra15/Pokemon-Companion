/**
 * Pokémon Companion
 * Trainer Classifier
 *
 * Determines trainer categories.
 *
 * Responsibilities:
 * - Classify trainers.
 *
 * Does NOT:
 * - Read databases.
 * - Build databases.
 */

"use strict";


class TrainerClassifier {


    classify(trainer) {


        const id =
            (trainer.id || "").toUpperCase();


        const trainerClass =
            (trainer.trainerClass || "").toUpperCase();


        const trainerPic =
            (trainer.trainerPic || "").toUpperCase();


        const trainerName =
            (trainer.trainerName || "").toUpperCase();



        //----------------------------------------
        // Elite Four
        //----------------------------------------

        if (

            trainerClass.includes("ELITE") ||

            trainerPic.includes("ELITE")

        ) {

            return "ELITE_FOUR";

        }



        //----------------------------------------
        // Champion
        //----------------------------------------

        if (

            id.includes("CHAMPION") ||

            trainerClass.includes("CHAMPION") ||

            trainerPic.includes("CHAMPION")

        ) {

            return "CHAMPION";

        }



        //----------------------------------------
        // Rival
        //----------------------------------------

        if (

            id.includes("RIVAL") ||

            trainerName.includes("RIVAL")

        ) {

            return "RIVAL";

        }



        //----------------------------------------
        // Team Villains
        //----------------------------------------

        if (

            trainerClass.includes("ROCKET") ||

            trainerClass.includes("AQUA") ||

            trainerClass.includes("MAGMA") ||

            trainerClass.includes("GALACTIC") ||

            trainerClass.includes("PLASMA")

        ) {

            return "VILLAIN_TEAM";

        }



        //----------------------------------------
        // Gym Leaders
        //----------------------------------------

        if (

            trainerClass.includes("LEADER") ||

            trainerPic.includes("LEADER")

        ) {

            return "GYM_LEADER";

        }


        
        //----------------------------------------
        // Default
        //----------------------------------------

        return "TRAINER";

    }


}


module.exports = TrainerClassifier;