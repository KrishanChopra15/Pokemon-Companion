/**
 * Pokémon Companion
 * Trainer Difficulty Service
 *
 * Calculates trainer difficulty.
 *
 * Responsibilities:
 * - Score trainer battles.
 * - Classify difficulty.
 *
 * Does NOT:
 * - Load databases.
 * - Parse data.
 */

"use strict";


class TrainerDifficultyService {


    calculate(analysis) {


        let score = 0;


        const type =
            analysis.type;



        //----------------------------------------
        // Base team strength
        //----------------------------------------


        // Team size
        score +=
            analysis.teamSize * 5;



        // Average level
        score +=
            analysis.averageLevel;



        // Highest level
        score +=
            analysis.highestLevel;



        // Base stat power
        score +=
            Math.floor(
                analysis.teamPower / 150
            );



        //----------------------------------------
        // Trainer category modifier
        //----------------------------------------


        if (type === "GYM_LEADER") {

            score += 5;

        }



        if (type === "ELITE_FOUR") {

            score += 20;

        }



        if (type === "CHAMPION") {

            score += 30;

        }



        if (type === "RIVAL") {

            score += 10;

        }



        //----------------------------------------
        // Difficulty classification
        //----------------------------------------


        let difficulty =
            "EASY";



        if (score >= 80) {

            difficulty = "HARD";

        }
        else if (score >= 45) {

            difficulty = "MEDIUM";

        }



        return {

            score,

            difficulty

        };

    }


}


module.exports = TrainerDifficultyService;