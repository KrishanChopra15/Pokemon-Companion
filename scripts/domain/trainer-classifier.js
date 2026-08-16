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
            String(trainer.id || "")
                .toUpperCase();



        const trainerClass =
            String(trainer.trainerClass || "")
                .toUpperCase();



        const trainerPic =
            String(trainer.trainerPic || "")
                .toUpperCase();



        const trainerName =
            String(trainer.trainerName || "")
                .toUpperCase();





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
        // Elite Four
        //----------------------------------------

        if (

            trainerClass.includes("ELITE") ||

            trainerPic.includes("ELITE")

        ) {

            return "ELITE_FOUR";

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
        // Rival
        //----------------------------------------

        if (

            id.includes("RIVAL") ||

            trainerName.includes("RIVAL")

        ) {

            return "RIVAL";

        }





        //----------------------------------------
        // Villain Team
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
        // Default
        //----------------------------------------

        return "TRAINER";


    }


}



module.exports =
    TrainerClassifier;